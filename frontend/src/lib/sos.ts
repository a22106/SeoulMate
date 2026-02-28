export interface SOSScript {
	korean: string;
	romanized: string;
	translationKey: string;
}

export interface SOSCategory {
	id: "police" | "fire" | "hospital";
	number: string;
	iconKey: string;
	titleKey: string;
	scripts: SOSScript[];
}

export const SOS_CATEGORIES: SOSCategory[] = [
	{
		id: "police",
		number: "112",
		iconKey: "sos.police.icon",
		titleKey: "sos.police",
		scripts: [
			{
				korean: "도와주세요! 외국인입니다.",
				romanized: "Dowajuseyo! Oegugin-imnida.",
				translationKey: "sos.police.help",
			},
			{
				korean: "여기 주소는...",
				romanized: "Yeogi jusoneun...",
				translationKey: "sos.police.address",
			},
			{
				korean: "영어 통역이 필요합니다.",
				romanized: "Yeongeo tongyeog-i pilyohabnida.",
				translationKey: "sos.police.interpreter",
			},
			{
				korean: "도둑이에요!",
				romanized: "Dodug-ieyo!",
				translationKey: "sos.police.thief",
			},
		],
	},
	{
		id: "fire",
		number: "119",
		iconKey: "sos.fire.icon",
		titleKey: "sos.fire",
		scripts: [
			{
				korean: "구급차가 필요합니다!",
				romanized: "Gugeupchaga pilyohabnida!",
				translationKey: "sos.fire.ambulance",
			},
			{
				korean: "화재입니다!",
				romanized: "Hwajae-imnida!",
				translationKey: "sos.fire.fire",
			},
			{
				korean: "사람이 쓰러졌어요.",
				romanized: "Saram-i ssureojyeosseoyo.",
				translationKey: "sos.fire.collapse",
			},
			{
				korean: "숨을 못 쉬어요.",
				romanized: "Sum-eul mot swiyeoyo.",
				translationKey: "sos.fire.breathing",
			},
		],
	},
	{
		id: "hospital",
		number: "1339",
		iconKey: "sos.hospital.icon",
		titleKey: "sos.hospital",
		scripts: [
			{
				korean: "응급실이 어디예요?",
				romanized: "Eunggeupsil-i eodiyeyo?",
				translationKey: "sos.hospital.er",
			},
			{
				korean: "여기가 아파요.",
				romanized: "Yeogiga apayo.",
				translationKey: "sos.hospital.pain",
			},
			{
				korean: "알레르기가 있습니다.",
				romanized: "Allereugi-ga issseubnida.",
				translationKey: "sos.hospital.allergy",
			},
			{
				korean: "약을 먹고 있습니다.",
				romanized: "Yag-eul meokgo issseubnida.",
				translationKey: "sos.hospital.medication",
			},
		],
	},
];
