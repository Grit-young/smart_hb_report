import { GoogleGenAI, Type } from "@google/genai";
import { ReportData, StudentInfo } from "../types";

const getAi = () => {
    // Vite define replaces process.env.GEMINI_API_KEY
    let key = '';
    try {
        key = process.env.GEMINI_API_KEY || '';
    } catch (e) {
        // Fallback for environments where process is not defined
    }
    
    if (!key) {
        throw new Error("API 키가 설정되지 않았습니다 (GEMINI_API_KEY).");
    }
    return new GoogleGenAI({ apiKey: key });
};

export const extractStudentInfo = async (
    files: { data: string; mimeType: string }[]
): Promise<Partial<StudentInfo>> => {
    const ai = getAi();
    const prompt = `업로드된 수학 학원 학생의 시험지, 평가지, 또는 리포트 사진(이미지/PDF)에서 학생의 기본 정보를 추출해 주세요.
매우 흐릿하게 적힌 손글씨나 상단 구석의 이름도 꼭 찾아내 주세요.
찾을 수 없는 정보나 불확실한 정보는 빈 문자열("")로 반환하세요.
- 학생 이름: "이름:" 옆이 아니더라도 상단에 적힌 세 글자 이름 등을 추출해주세요.
- 학년은 명확할 경우 반드시 "초1", "초2", "초3", "초4", "초5", "초6", "중1", "중2", "중3" 중의 형식으로 변환해서 적어주세요 (예: 초등학교 4학년 -> 초4).
- 날짜는 "YYYY-MM-DD" 형태로 나타내주세요.
- 단원명: "단원", "범위", "주제" 등으로 표기된 내용을 적어주세요.`;

    const parts: any[] = [{ text: prompt }];

    files.forEach(file => {
        parts.push({
            inlineData: {
                data: file.data,
                mimeType: file.mimeType
            }
        });
    });

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.1-pro-preview", // 구조화 정보 추출을 위해 매우 정확한 Pro 모델 사용
            contents: { parts },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        student_name: { type: Type.STRING, description: "학생 이름" },
                        grade: { type: Type.STRING, description: "학습자 학년" },
                        test_date: { type: Type.STRING, description: "시험일 또는 학습일자 (YYYY-MM-DD)" },
                        unit_name: { type: Type.STRING, description: "단원명 (예: 4단원 사각형)" }
                    }
                }
            }
        });

        const text = response.text;
        if (!text) return {};
        console.log("Raw LLM text:", text);
        return JSON.parse(text);
    } catch (e) {
        console.error("Extraction error:", e);
        throw e;
    }
};

export const generateFeedbackReport = async (
    studentInfo: StudentInfo,
    files: { data: string; mimeType: string }[]
): Promise<ReportData> => {
    const ai = getAi();

    const prompt = `당신은 20년 경력의 베테랑 수학학원 원장이자 상담 전문가입니다.
학생의 정보와 업로드된 시험지/분석표 이미지를 바탕으로 학부모에게 보낼 분석 리포트를 작성해야 합니다.

[학생 정보]
이름: ${studentInfo.student_name}
학년: ${studentInfo.grade}
성별: ${studentInfo.gender ? studentInfo.gender : '미입력'}
시험일: ${studentInfo.test_date}
단원명: ${studentInfo.unit_name}

[분석 지시사항]
제공된 이미지를 분석하여 학생의 점수, 취약점, 강점 등을 파악하세요.
이미지가 제공되지 않았거나 내용을 판독하기 어렵다면, 학생 정보(특히 학년과 단원명)를 바탕으로 가장 그럴듯한 가상의 분석 결과를 작성하세요.

[중요한 작성 원칙]
- 단점만 강조하지 말고, 강점과 보완점을 균형 있게 작성하세요.
- 학부모가 불안하거나 불쾌해지지 않도록 주의하세요 (예: "이해가 부족합니다", "집중을 안 했습니다" 같은 직설 언어 금지).
- 전문적이고 부드러우며 구체적인 문장을 사용하세요. (예: "조건을 꼼꼼히 확인하는 연습이 더해지면 훨씬 좋아질 것입니다.")
- 부모가 "이 학원은 내 아이를 정확히 파악하고 개별적으로 관리하는구나"라고 느끼게 하세요.
- 복붙 티가 나지 않게 자연스럽게 작성하세요.

[학년별 톤 규칙]
- 초1~초2: 아주 쉽고 따뜻하게, 안심 중심
- 초3~초4: 성장 과정과 학습 습관을 함께 언급
- 초5~초6: 개념 정리, 응용 연결, 다음 단원 준비도 강조
- 중1~중3: 개념 완성도, 문제해결력, 자기주도 학습 태도, 내신 연결성 강조

[성취 수준별 규칙]
- 상위권: 잘하는 점을 분명히 말하고, 더 성장할 심화 포인트를 제안
- 보통권: 안정된 부분을 칭찬하고, 보완하면 좋아질 지점을 명확히 설명
- 오답 다수: 불안감을 주지 말고, 회복 가능한 구조와 철저한 학원 관리 계획을 강조

반드시 아래 제공된 JSON 스키마에 맞추어 응답을 반환하세요.`;

    const parts: any[] = [];
    parts.push({ text: prompt });

    files.forEach(file => {
        parts.push({
            inlineData: {
                data: file.data,
                mimeType: file.mimeType
            }
        });
    });

    const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: { parts },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    score: { type: Type.INTEGER, description: "예상 점수 (0-100)" },
                    achievement_level: { type: Type.STRING, description: "상위권, 보통권, 기초부족 등 성취 수준" },
                    strengths: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "강점 2~3개 (각 문장은 명사형 종결이나 자연스러운 평서문)"
                    },
                    weak_points: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "취약 포인트 1~3개 (부드러운 표현 사용)"
                    },
                    error_causes: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "오답 원인 분석 1~2개"
                    },
                    next_unit_connection: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "다음 단원 연결 설명 (다음 단원명 포함)"
                    },
                    academy_plan: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "학원 관리 계획 (예: 오답노트 작성, 1:1 보충 등)"
                    },
                    home_support_points: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "가정 협조 포인트 1~2개 (부모님이 집에서 해줄 수 있는 간단한 지도)"
                    },
                    kakao_short: {
                        type: Type.STRING,
                        description: "카카오톡용 짧은 버전 (3-4문장, 인사말 포함)"
                    },
                    kakao_standard: {
                        type: Type.STRING,
                        description: "카카오톡용 표준 버전 (총평, 강점, 보완점, 향후 계획 포함)"
                    },
                    kakao_detailed: {
                        type: Type.STRING,
                        description: "상담용 상세 버전 (구간별 상세 분석 및 학원 지도 철학 포함)"
                    }
                },
                required: [
                    "score", "achievement_level", "strengths", "weak_points", "error_causes",
                    "next_unit_connection", "academy_plan", "home_support_points",
                    "kakao_short", "kakao_standard", "kakao_detailed"
                ]
            }
        }
    });

    const text = response.text;
    if (!text) {
        throw new Error("AI 응답이 비어있습니다.");
    }

    const data: ReportData = {
        ...studentInfo,
        ...JSON.parse(text)
    };

    return data;
};
