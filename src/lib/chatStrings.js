/**
 * Strings the chat launcher needs before the engine (and its data) loads.
 * Kept free of data imports so the main bundle stays small.
 */
export const HELLO = {
  en: "Hi! I'm Yang Yang, the festival goat. Ask me about the schedule, vendors, tickets, parking, or anything about Lunar New Year traditions. I understand English, 中文, Tiếng Việt, 한국어, and 日本語.",
  zh: "你好！我是羊羊，庆典的小山羊。可以问我活动日程、商户、门票、停车，或者任何关于农历新年习俗的问题。我懂中文、English、Tiếng Việt、한국어和日本語。",
  vi: "Xin chào! Mình là Yang Yang, chú dê của lễ hội. Hỏi mình về lịch trình, gian hàng, vé, bãi đậu xe hoặc bất cứ điều gì về phong tục Tết. Mình hiểu Tiếng Việt, English, 中文, 한국어 và 日本語.",
  ko: "안녕하세요! 저는 축제의 양, 양양이에요. 일정, 참여 업체, 티켓, 주차, 그리고 설날 풍습에 대해 무엇이든 물어보세요. 한국어, English, 中文, Tiếng Việt, 日本語를 이해해요.",
  ja: "こんにちは！祭りのひつじ、ヤンヤンです。スケジュール、出店、チケット、駐車場、旧正月の風習など何でも聞いてください。日本語、English、中文、Tiếng Việt、한국어がわかります。",
}

/** Suggested starter questions per language (shown as chips in the widget). */
export const SUGGESTIONS = {
  en: ['What is on Saturday?', 'Where can I get dumplings?', 'Why are red envelopes given?', 'Where do I park?'],
  zh: ['周六有什么活动？', '哪里有饺子？', '为什么要发红包？', '在哪里停车？'],
  vi: ['Thứ Bảy có gì?', 'Mua sủi cảo ở đâu?', 'Tại sao lì xì?', 'Đậu xe ở đâu?'],
  ko: ['토요일에 뭐 해요?', '만두는 어디서 사요?', '세뱃돈은 왜 주나요?', '주차는 어디에?'],
  ja: ['土曜日は何がありますか？', '餃子はどこで買えますか？', 'なぜお年玉を渡すのですか？', '駐車場はどこですか？'],
}
