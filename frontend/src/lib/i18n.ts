const translations: Record<string, Record<string, string>> = {
	English: {
		"welcome.subtitle":
			"Your AI assistant for navigating life in Seoul. Ask a question or snap a photo of any Korean document.",
		"welcome.cta": "📸 Scan a Document",
		"welcome.cta.sub": "Take a photo of any Korean document for instant help",
		"input.placeholder": "Ask about life in Seoul...",
		copy: "📋 Copy",
		copied: "✅ Copied!",
		newChat: "+ New",
		disclaimer:
			"SeoulMate may make mistakes. Verify important information with official sources.",
		"guide.housing": "Housing",
		"guide.recycling": "Recycling",
		"guide.healthcare": "Healthcare",
		"guide.visa": "Visa & Admin",
		"guide.transport": "Transport",
		"guide.banking": "Banking",
	},
	한국어: {
		"welcome.subtitle":
			"서울 생활을 도와주는 AI 어시스턴트입니다. 질문하거나 한국어 문서를 촬영해 보세요.",
		"welcome.cta": "📸 문서 촬영하기",
		"welcome.cta.sub": "한국어 문서를 촬영하면 바로 도움을 받을 수 있어요",
		"input.placeholder": "서울 생활에 대해 물어보세요...",
		copy: "📋 복사",
		copied: "✅ 복사됨!",
		newChat: "+ 새 대화",
		disclaimer:
			"SeoulMate는 실수할 수 있습니다. 중요한 정보는 공식 출처에서 확인하세요.",
		"guide.housing": "주거",
		"guide.recycling": "분리수거",
		"guide.healthcare": "의료",
		"guide.visa": "비자·행정",
		"guide.transport": "교통",
		"guide.banking": "금융",
	},
	中文: {
		"welcome.subtitle":
			"帮助您在首尔生活的AI助手。提问或拍摄任何韩文文件即可获得帮助。",
		"welcome.cta": "📸 扫描文件",
		"welcome.cta.sub": "拍摄任何韩文文件，立即获得帮助",
		"input.placeholder": "询问首尔生活相关问题...",
		copy: "📋 复制",
		copied: "✅ 已复制!",
		newChat: "+ 新对话",
		disclaimer: "SeoulMate可能会出错。请通过官方渠道核实重要信息。",
		"guide.housing": "住房",
		"guide.recycling": "垃圾分类",
		"guide.healthcare": "医疗",
		"guide.visa": "签证·行政",
		"guide.transport": "交通",
		"guide.banking": "银行",
	},
	"Tiếng Việt": {
		"welcome.subtitle":
			"Trợ lý AI giúp bạn sống ở Seoul. Đặt câu hỏi hoặc chụp ảnh tài liệu tiếng Hàn.",
		"welcome.cta": "📸 Quét tài liệu",
		"welcome.cta.sub":
			"Chụp ảnh bất kỳ tài liệu tiếng Hàn nào để được hỗ trợ ngay",
		"input.placeholder": "Hỏi về cuộc sống ở Seoul...",
		copy: "📋 Sao chép",
		copied: "✅ Đã sao chép!",
		newChat: "+ Mới",
		disclaimer:
			"SeoulMate có thể mắc lỗi. Hãy xác minh thông tin quan trọng với nguồn chính thức.",
		"guide.housing": "Nhà ở",
		"guide.recycling": "Phân loại rác",
		"guide.healthcare": "Y tế",
		"guide.visa": "Visa·Hành chính",
		"guide.transport": "Giao thông",
		"guide.banking": "Ngân hàng",
	},
	日本語: {
		"welcome.subtitle":
			"ソウル生活をサポートするAIアシスタントです。質問するか、韓国語の書類を撮影してください。",
		"welcome.cta": "📸 書類をスキャン",
		"welcome.cta.sub": "韓国語の書類を撮影すると、すぐにサポートを受けられます",
		"input.placeholder": "ソウル生活について質問...",
		copy: "📋 コピー",
		copied: "✅ コピー済み!",
		newChat: "+ 新規",
		disclaimer:
			"SeoulMateは間違えることがあります。重要な情報は公式情報源でご確認ください。",
		"guide.housing": "住居",
		"guide.recycling": "ゴミ分別",
		"guide.healthcare": "医療",
		"guide.visa": "ビザ·行政",
		"guide.transport": "交通",
		"guide.banking": "銀行",
	},
};

export function t(language: string, key: string): string {
	return translations[language]?.[key] ?? translations.English[key] ?? key;
}
