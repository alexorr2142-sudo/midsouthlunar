/**
 * Yang Yang, the festival assistant. Pure, dependency-free engine that runs
 * in the browser: detects the language of a question, picks an intent, and
 * answers from the site's own data (event, schedule, vendors, FAQ) and the
 * curated Lunar New Year knowledge base, in the language of the question.
 *
 * No network, no keys. Optional AI uses a protected server and falls back
 * to this engine; venue answers always use site data (see lib/gemini.js).
 *
 * answer(text, { lang, now }) -> { text, lang, intent, links: [{to,label}] }
 */
import event from '../data/event.json'
import schedule from '../data/schedule.json'
import vendors from '../data/vendors.json'
import knowledge from '../data/knowledge.json'
import { getEventState, festivalDate } from './countdown.js'
import { normalize } from './filter.js'
import extraLocales from './chatLocales.json'
import chatLinkCopy from './chatLinkCopy.json'
import { externalLink } from './links.js'
import { HELLO } from './chatStrings.js'

export const CHAT_LANGS = ['en', 'zh', 'zh-Hant', 'th', 'vi', 'ko', 'ja']

// ---------- language detection ----------
const RE_HANGUL = /[가-힯ᄀ-ᇿ㄰-㆏]/
const RE_KANA = /[぀-ヿ]/
const RE_HAN = /[一-鿿]/
const RE_VI = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹĂÂĐÊÔƠƯ]/
const RE_THAI = /[\u0e00-\u0e7f]/
const RE_TRADITIONAL = /[體慶農曆會門這裡學歡觀傳禮歷龍餃開關萬臺週麼發錢獅燈]/

/** Script-based detection. Plain Latin text follows the UI language when that is Vietnamese, else English. */
export function detectLang(text, uiLang = 'en') {
  if (RE_THAI.test(text)) return 'th'
  if (RE_HANGUL.test(text)) return 'ko'
  if (RE_KANA.test(text)) return 'ja'
  if (RE_HAN.test(text)) {
    if (uiLang === 'ja') return 'ja'
    return uiLang === 'zh-Hant' || RE_TRADITIONAL.test(text) ? 'zh-Hant' : 'zh'
  }
  if (RE_VI.test(text)) return 'vi'
  return uiLang === 'vi' ? 'vi' : 'en'
}

// ---------- small i18n for the engine's own sentences ----------
const T = {
  en: {
    hello: "Hi! I'm Yang Yang, the festival goat. Ask me about the schedule, vendors, tickets, parking, or anything about Lunar New Year traditions. I understand English, 中文, Tiếng Việt, 한국어, and 日本語.",
    hours: `The festival runs ${'Friday, February 5'} and ${'Saturday, February 6, 2027'}, 10 AM to 9 PM both days, at Agricenter International, 7777 Walnut Grove Rd, Memphis. February 5 is Lunar New Year's Eve and February 6 is New Year's Day, the start of the Year of the Goat.`,
    location: 'The festival is at Agricenter International, 7777 Walnut Grove Rd, Memphis, TN 38120. Parking is free in the main lots off Walnut Grove Road; accessible parking and drop-off are by the main entrance, and rideshare pick-up is at the north lot.',
    tickets: 'Tickets are sold through Eventbrite. Pricing will be announced soon, with children\'s pricing available. The Tickets & Visit page has the link.',
    volunteer: 'Volunteers help with setup, information booths, kids\' activities, and translation, and students are welcome. The Get Involved page has the sign-up form.',
    vendorApply: 'Food stalls, crafts, and cultural organizations are welcome as vendors. Applications open soon; the Get Involved page has the form.',
    sponsor: 'Sponsorship reaches 20,000 attendees from across the Mid-South, with tiers for every size of business. The Get Involved page has contact details.',
    accessibility: 'All festival areas are on one level and wheelchair accessible, accessible restrooms are in every hall, service animals are welcome, and a quiet room is available on request at the information booth.',
    weather: 'The festival runs rain or shine. Most activities are indoors; the lantern walk is outdoors, so dress for February. Check this site and social media for any changes.',
    payment: 'Most vendors accept cards and mobile payments, some accept cash, and there is an ATM on site.',
    kids: 'Yes. The Family Garden has games, crafts, face painting, and red envelopes all day, plus the lantern walk on Friday evening.',
    schedIntro: (n) => `I found ${n} matching event${n === 1 ? '' : 's'}:`,
    schedNone: 'I could not find an event matching that. Try a day (Friday, Saturday), an area (Main Stage, Food Hall, Family Garden), or a type (performance, food, culture, family).',
    nowOpen: (n) => `Right now, ${n} thing${n === 1 ? ' is' : 's are'} happening:`,
    nowClosed: 'The festival is not open right now. Doors are open 10 AM to 9 PM on February 5 and 6, 2027.',
    nowNext: 'Coming up next:',
    vendIntro: (n) => `I found ${n} vendor${n === 1 ? '' : 's'}:`,
    vendNone: 'I could not find a vendor matching that. Try a food (dumplings, tea, hot pot), a craft (lanterns, calligraphy, ceramics), or a category.',
    langHint: 'You can switch the whole site with the language menu at the top of the page. I will answer in whichever language you write in.',
    fallback: 'I am not sure about that one. I can help with the schedule, vendors, tickets, parking, accessibility, and Lunar New Year traditions. Try asking "What is on Saturday?", "Where can I get dumplings?", or "Why are red envelopes given?"',
    booth: 'Booth', more: 'See the full schedule', moreVendors: 'See all vendors', visit: 'Tickets & Visit', involved: 'Get Involved', about: 'Traditions',
    day: { day1: 'Fri Feb 5', day2: 'Sat Feb 6' },
  },
  zh: {
    hello: '你好！我是羊羊，庆典的小山羊。可以问我活动日程、商户、门票、停车，或者任何关于农历新年习俗的问题。我懂中文、English、Tiếng Việt、한국어和日本語。',
    hours: '庆典于2027年2月5日（周五）和2月6日（周六）举行，两天均为上午10点至晚上9点，地点在孟菲斯 Agricenter International（7777 Walnut Grove Rd）。2月5日是除夕，2月6日是大年初一，羊年开始。',
    location: '地点：Agricenter International，7777 Walnut Grove Rd, Memphis, TN 38120。Walnut Grove Road 旁的主停车场免费；无障碍车位和下客区在主入口附近；网约车上车点在北停车场。',
    tickets: '门票通过 Eventbrite 销售，票价即将公布，将提供儿童票。“门票与交通”页面有购票链接。',
    volunteer: '志愿者协助布置、咨询台、儿童活动和翻译，欢迎学生参加。“参与我们”页面有报名表。',
    vendorApply: '欢迎美食摊位、手工艺和文化机构申请商户。申请即将开放，“参与我们”页面有申请表。',
    sponsor: '赞助可触达来自中南地区的两万名参与者，有适合各种规模企业的方案。“参与我们”页面有联系方式。',
    accessibility: '所有活动区域均在同一层，轮椅可通行；每个展馆有无障碍洗手间；欢迎服务犬；可在咨询台申请安静室。',
    weather: '庆典风雨无阻。大部分活动在室内，花灯小径在室外，请注意保暖。如有变动请关注本网站和社交媒体。',
    payment: '大多数商户接受银行卡和移动支付，部分接受现金，现场有 ATM。',
    kids: '有的。亲子园全天有游戏、手工、脸绘和红包活动，周五晚还有花灯小径。',
    schedIntro: (n) => `找到 ${n} 项相关活动：`,
    schedNone: '没有找到相关活动。可以试试日期（周五、周六）、区域（主舞台、美食区、亲子园）或类型（演出、美食、文化、亲子）。',
    nowOpen: (n) => `现在正在进行的有 ${n} 项活动：`,
    nowClosed: '庆典目前未开放。开放时间为2027年2月5日和6日上午10点至晚上9点。',
    nowNext: '接下来：',
    vendIntro: (n) => `找到 ${n} 家商户：`,
    vendNone: '没有找到相关商户。可以试试食物（饺子、茶、火锅）、手工艺（灯笼、书法、陶瓷）或类别。',
    langHint: '页面顶部的语言菜单可以切换整个网站的语言。你用哪种语言提问，我就用哪种语言回答。',
    fallback: '这个问题我不太确定。我可以帮忙查日程、商户、门票、停车、无障碍设施和农历新年习俗。试试问“周六有什么活动？”“哪里有饺子？”或“为什么要发红包？”',
    booth: '展位', more: '查看完整日程', moreVendors: '查看全部商户', visit: '门票与交通', involved: '参与我们', about: '年俗',
    day: { day1: '2月5日 周五', day2: '2月6日 周六' },
  },
  vi: {
    hello: 'Xin chào! Mình là Yang Yang, chú dê của lễ hội. Hỏi mình về lịch trình, gian hàng, vé, bãi đậu xe hoặc bất cứ điều gì về phong tục Tết. Mình hiểu Tiếng Việt, English, 中文, 한국어 và 日本語.',
    hours: 'Lễ hội diễn ra thứ Sáu 5/2 và thứ Bảy 6/2/2027, 10 giờ sáng đến 9 giờ tối cả hai ngày, tại Agricenter International, 7777 Walnut Grove Rd, Memphis. Ngày 5/2 là giao thừa và 6/2 là mùng 1 Tết, bắt đầu năm Mùi.',
    location: 'Địa điểm: Agricenter International, 7777 Walnut Grove Rd, Memphis, TN 38120. Đậu xe miễn phí tại bãi chính cạnh Walnut Grove Road; chỗ đậu xe cho người khuyết tật và khu thả khách gần lối vào chính; điểm đón xe công nghệ ở bãi phía bắc.',
    tickets: 'Vé bán qua Eventbrite. Giá vé sẽ sớm được công bố, có giá vé trẻ em. Trang Vé & Đường đi có liên kết.',
    volunteer: 'Tình nguyện viên hỗ trợ dựng sân khấu, quầy thông tin, hoạt động trẻ em và phiên dịch; chào đón sinh viên. Trang Tham gia có mẫu đăng ký.',
    vendorApply: 'Chào đón quầy ẩm thực, thủ công và các tổ chức văn hóa đăng ký gian hàng. Sắp mở đăng ký, trang Tham gia có mẫu đơn.',
    sponsor: 'Tài trợ tiếp cận 20.000 người tham dự từ khắp vùng Trung Nam, có gói cho mọi quy mô doanh nghiệp. Trang Tham gia có thông tin liên hệ.',
    accessibility: 'Toàn bộ khu lễ hội trên một tầng, xe lăn đi lại được; nhà vệ sinh dành cho người khuyết tật ở mọi khu nhà; chào đón chó dịch vụ; có phòng yên tĩnh theo yêu cầu tại quầy thông tin.',
    weather: 'Lễ hội diễn ra bất kể mưa nắng. Hầu hết hoạt động trong nhà; đường hoa đăng ngoài trời nên hãy mặc ấm. Theo dõi trang này và mạng xã hội để biết thay đổi.',
    payment: 'Hầu hết gian hàng nhận thẻ và thanh toán di động, một số nhận tiền mặt, có máy ATM tại chỗ.',
    kids: 'Có. Vườn gia đình có trò chơi, thủ công, vẽ mặt và lì xì cả ngày, cùng đường hoa đăng tối thứ Sáu.',
    schedIntro: (n) => `Mình tìm thấy ${n} hoạt động phù hợp:`,
    schedNone: 'Mình không tìm thấy hoạt động nào phù hợp. Thử theo ngày (thứ Sáu, thứ Bảy), khu vực (Sân khấu chính, Khu ẩm thực, Vườn gia đình) hoặc loại (biểu diễn, ẩm thực, văn hóa, gia đình).',
    nowOpen: (n) => `Ngay bây giờ có ${n} hoạt động đang diễn ra:`,
    nowClosed: 'Lễ hội hiện chưa mở cửa. Giờ mở cửa: 10 giờ sáng đến 9 giờ tối ngày 5 và 6 tháng 2 năm 2027.',
    nowNext: 'Sắp tới:',
    vendIntro: (n) => `Mình tìm thấy ${n} gian hàng:`,
    vendNone: 'Mình không tìm thấy gian hàng phù hợp. Thử một món ăn (sủi cảo, trà, lẩu), một món thủ công (đèn lồng, thư pháp, gốm) hoặc danh mục.',
    langHint: 'Bạn có thể đổi ngôn ngữ toàn trang bằng menu ngôn ngữ ở đầu trang. Bạn viết bằng ngôn ngữ nào, mình trả lời bằng ngôn ngữ đó.',
    fallback: 'Câu này mình chưa chắc. Mình có thể giúp về lịch trình, gian hàng, vé, bãi đậu xe, tiếp cận và phong tục Tết. Thử hỏi "Thứ Bảy có gì?", "Mua sủi cảo ở đâu?" hoặc "Tại sao lì xì?"',
    booth: 'Gian', more: 'Xem toàn bộ lịch trình', moreVendors: 'Xem tất cả gian hàng', visit: 'Vé & Đường đi', involved: 'Tham gia', about: 'Phong tục',
    day: { day1: 'Thứ Sáu 5/2', day2: 'Thứ Bảy 6/2' },
  },
  ko: {
    hello: '안녕하세요! 저는 축제의 양, 양양이에요. 일정, 참여 업체, 티켓, 주차, 그리고 설날 풍습에 대해 무엇이든 물어보세요. 한국어, English, 中文, Tiếng Việt, 日本語를 이해해요.',
    hours: '축제는 2027년 2월 5일(금)과 6일(토), 양일 오전 10시부터 오후 9시까지 멤피스 Agricenter International(7777 Walnut Grove Rd)에서 열립니다. 2월 5일은 섣달그믐, 6일은 설날로 양의 해가 시작됩니다.',
    location: '장소: Agricenter International, 7777 Walnut Grove Rd, Memphis, TN 38120. Walnut Grove Road 쪽 주 주차장은 무료이고, 장애인 주차와 하차 구역은 정문 근처, 차량 호출 승차 지점은 북쪽 주차장입니다.',
    tickets: '티켓은 Eventbrite에서 판매합니다. 가격은 곧 공지되며 어린이 요금도 있습니다. 티켓 & 오시는 길 페이지에 링크가 있어요.',
    volunteer: '자원봉사자는 설치, 안내 부스, 어린이 활동, 통역을 돕고 학생도 환영합니다. 참여하기 페이지에 신청 양식이 있어요.',
    vendorApply: '음식 부스, 공예, 문화 단체의 업체 참여를 환영합니다. 신청은 곧 시작되며 참여하기 페이지에 양식이 있어요.',
    sponsor: '후원은 미드사우스 전역의 2만 명 방문객에게 닿으며 모든 규모의 기업을 위한 등급이 있습니다. 참여하기 페이지에 연락처가 있어요.',
    accessibility: '모든 축제 구역은 단층으로 휠체어 이동이 가능하고, 장애인 화장실이 모든 홀에 있으며, 안내견을 환영하고, 안내 부스에 요청하면 조용한 방을 이용할 수 있습니다.',
    weather: '축제는 날씨와 관계없이 열립니다. 대부분 실내이고 등불 산책은 야외이니 2월 날씨에 맞게 입으세요. 변경 사항은 이 사이트와 소셜 미디어에서 확인하세요.',
    payment: '대부분의 업체가 카드와 모바일 결제를 받고 일부는 현금도 받습니다. 현장에 ATM이 있어요.',
    kids: '네. 가족 정원에서 하루 종일 놀이, 만들기, 페이스 페인팅, 세뱃돈 봉투 행사가 있고 금요일 저녁에는 등불 산책이 있어요.',
    schedIntro: (n) => `${n}개의 행사를 찾았어요:`,
    schedNone: '맞는 행사를 찾지 못했어요. 날짜(금요일, 토요일), 구역(메인 무대, 푸드홀, 가족 정원), 종류(공연, 음식, 문화, 가족)로 물어보세요.',
    nowOpen: (n) => `지금 진행 중인 행사가 ${n}개 있어요:`,
    nowClosed: '지금은 축제가 열려 있지 않아요. 2027년 2월 5일과 6일 오전 10시부터 오후 9시까지 운영합니다.',
    nowNext: '다음 순서:',
    vendIntro: (n) => `업체 ${n}곳을 찾았어요:`,
    vendNone: '맞는 업체를 찾지 못했어요. 음식(만두, 차, 훠궈), 공예(등불, 서예, 도자기), 또는 분류로 물어보세요.',
    langHint: '페이지 상단의 언어 메뉴로 사이트 전체 언어를 바꿀 수 있어요. 어떤 언어로 쓰시든 그 언어로 답할게요.',
    fallback: '그건 잘 모르겠어요. 일정, 업체, 티켓, 주차, 접근성, 설날 풍습에 대해 도울 수 있어요. "토요일에 뭐 해요?", "만두는 어디서 사요?", "세뱃돈은 왜 주나요?" 같은 질문을 해 보세요.',
    booth: '부스', more: '전체 일정 보기', moreVendors: '모든 업체 보기', visit: '티켓 & 오시는 길', involved: '참여하기', about: '풍습',
    day: { day1: '2월 5일 금', day2: '2월 6일 토' },
  },
  ja: {
    hello: 'こんにちは！祭りのひつじ、ヤンヤンです。スケジュール、出店、チケット、駐車場、旧正月の風習など何でも聞いてください。日本語、English、中文、Tiếng Việt、한국어がわかります。',
    hours: '祭りは2027年2月5日（金）と6日（土）、両日とも午前10時から午後9時まで、メンフィスのAgricenter International（7777 Walnut Grove Rd）で開催されます。2月5日が大晦日、6日が元日で、未年の始まりです。',
    location: '会場はAgricenter International、7777 Walnut Grove Rd, Memphis, TN 38120。Walnut Grove Road側のメイン駐車場は無料、障がい者用駐車と乗降エリアはメイン入口付近、配車サービスの乗車場所は北駐車場です。',
    tickets: 'チケットはEventbriteで販売します。料金は近日発表、子ども料金もあります。チケット・アクセスのページにリンクがあります。',
    volunteer: 'ボランティアは設営、案内所、子ども向け催し、通訳をお手伝いします。学生も歓迎。参加するページに登録フォームがあります。',
    vendorApply: '飲食、工芸、文化団体の出店を歓迎します。申込は近日開始、参加するページにフォームがあります。',
    sponsor: '協賛はミッドサウス全域から訪れる2万人に届き、あらゆる規模の企業向けプランがあります。参加するページに連絡先があります。',
    accessibility: '会場はすべてワンフロアで車いす対応、各ホールにバリアフリートイレ、介助犬歓迎、案内所で静かな部屋を利用できます。',
    weather: '雨天決行です。ほとんどは屋内、提灯の小道は屋外なので2月の気候に合わせた服装で。変更はこのサイトとSNSでお知らせします。',
    payment: 'ほとんどの出店でカードとモバイル決済が使え、現金対応の店もあります。会場内にATMがあります。',
    kids: 'はい。ファミリーガーデンでは終日、遊び、工作、フェイスペイント、お年玉袋の催しがあり、金曜夜には提灯の小道もあります。',
    schedIntro: (n) => `${n}件の催しが見つかりました：`,
    schedNone: '該当する催しが見つかりませんでした。日付（金曜、土曜）、エリア（メインステージ、フードホール、ファミリーガーデン）、種類（公演、食、文化、ファミリー）で聞いてみてください。',
    nowOpen: (n) => `今、${n}件の催しが行われています：`,
    nowClosed: '祭りは今は開いていません。2027年2月5日と6日の午前10時から午後9時まで開場します。',
    nowNext: '次の催し：',
    vendIntro: (n) => `${n}件の出店が見つかりました：`,
    vendNone: '該当する出店が見つかりませんでした。食べ物（餃子、お茶、火鍋）、工芸（提灯、書道、陶磁器）、カテゴリーで聞いてみてください。',
    langHint: 'ページ上部の言語メニューでサイト全体の言語を切り替えられます。書かれた言語でお答えします。',
    fallback: 'それはよくわかりません。スケジュール、出店、チケット、駐車場、アクセシビリティ、旧正月の風習についてお手伝いできます。「土曜日は何がありますか」「餃子はどこで買えますか」「なぜお年玉を渡すのですか」などと聞いてみてください。',
    booth: 'ブース', more: 'スケジュール全体を見る', moreVendors: '出店をすべて見る', visit: 'チケット・アクセス', involved: '参加する', about: '風習',
    day: { day1: '2月5日（金）', day2: '2月6日（土）' },
  },
}

for (const [code, locale] of Object.entries(extraLocales)) {
  T[code] = { ...locale.engine }
  for (const key of ['schedIntro', 'nowOpen', 'vendIntro']) {
    T[code][key] = count => locale.engine[key].replace('{count}', String(count))
  }
}

for (const lang of CHAT_LANGS) T[lang].hello = HELLO[lang]

// ---------- intent keyword tables ----------
const KW = {
  greet: { en: ['hello', 'hi ', 'hi!', 'hey', 'good morning', 'good afternoon', 'who are you', 'what can you do', 'help'], zh: ['你好', '您好', '嗨', '你是谁', '你能做什么', '帮助'], vi: ['xin chào', 'chào', 'bạn là ai', 'giúp'], ko: ['안녕', '누구', '도와', '뭘 할 수'], ja: ['こんにちは', 'こんばんは', 'はじめまして', 'あなたは誰', '何ができ', 'ヘルプ'] },
  now: { en: ['right now', 'now', 'currently', 'at the moment', 'next up', "what's next", 'what is next'], zh: ['现在', '此刻', '接下来'], vi: ['bây giờ', 'hiện giờ', 'lúc này', 'tiếp theo'], ko: ['지금', '현재', '다음'], ja: ['今は', '今、', '今何', '今の', '今やっ', '現在', '次は', '次の'] },
  hours: { en: ['when is', 'what time', 'hours', 'open', 'dates', 'what day', 'how long is the festival', 'date'], zh: ['几点', '什么时候', '开放时间', '日期', '哪天', '时间'], vi: ['mấy giờ', 'khi nào', 'giờ mở', 'ngày nào', 'thời gian'], ko: ['몇 시', '언제', '운영 시간', '날짜', '시간'], ja: ['何時', 'いつ', '開催時間', '日程', '日付', '営業時間'] },
  location: { en: ['where is', 'location', 'address', 'parking', 'park', 'directions', 'how do i get', 'agricenter', 'rideshare', 'uber', 'lyft', 'entrance'], zh: ['在哪', '地址', '停车', '怎么去', '路线', '入口', '地点'], vi: ['ở đâu', 'địa chỉ', 'đậu xe', 'đường đi', 'làm sao để đến', 'lối vào', 'địa điểm'], ko: ['어디', '주소', '주차', '가는 법', '오시는', '입구', '장소'], ja: ['どこ', '住所', '駐車', '行き方', 'アクセス', '入口', '場所'] },
  tickets: { en: ['ticket', 'tickets', 'price', 'cost', 'how much', 'admission', 'free', 'eventbrite', 'buy'], zh: ['门票', '票', '价格', '多少钱', '免费', '购买'], vi: ['vé', 'giá', 'bao nhiêu', 'miễn phí', 'mua'], ko: ['티켓', '입장', '가격', '얼마', '무료', '구매'], ja: ['チケット', '入場', '料金', 'いくら', '無料', '購入'] },
  volunteer: { en: ['volunteer', 'volunteering', 'help out'], zh: ['志愿', '义工'], vi: ['tình nguyện'], ko: ['자원봉사', '봉사'], ja: ['ボランティア'] },
  vendorApply: { en: ['become a vendor', 'apply', 'application', 'sell at', 'booth cost', 'vendor registration', 'register as a vendor'], zh: ['申请', '报名摊位', '成为商户', '摊位费'], vi: ['đăng ký gian hàng', 'đăng ký bán', 'trở thành'], ko: ['업체 신청', '부스 신청', '참여 업체가 되', '입점'], ja: ['出店したい', '出店申込', '申し込み', '申込'] },
  sponsor: { en: ['sponsor', 'sponsorship', 'advertise'], zh: ['赞助', '广告'], vi: ['tài trợ', 'quảng cáo'], ko: ['후원', '광고', '스폰서'], ja: ['スポンサー', '協賛', '広告'] },
  accessibility: { en: ['wheelchair', 'accessible', 'accessibility', 'disabled', 'service animal', 'quiet room', 'stroller', 'restroom', 'bathroom'], zh: ['轮椅', '无障碍', '残疾', '服务犬', '安静室', '洗手间', '厕所'], vi: ['xe lăn', 'khuyết tật', 'tiếp cận', 'chó dịch vụ', 'phòng yên tĩnh', 'nhà vệ sinh'], ko: ['휠체어', '장애', '접근성', '안내견', '조용한 방', '화장실'], ja: ['車いす', '車椅子', 'バリアフリー', '障がい', '介助犬', '静かな部屋', 'トイレ'] },
  weather: { en: ['weather', 'rain', 'cold', 'indoor', 'outdoor', 'outside', 'inside'], zh: ['天气', '下雨', '冷', '室内', '室外'], vi: ['thời tiết', 'mưa', 'lạnh', 'trong nhà', 'ngoài trời'], ko: ['날씨', '비', '추', '실내', '야외'], ja: ['天気', '雨', '寒', '屋内', '屋外'] },
  payment: { en: ['cash', 'credit card', 'pay', 'atm', 'apple pay', 'venmo'], zh: ['现金', '刷卡', '支付', 'atm', '付款'], vi: ['tiền mặt', 'thẻ', 'thanh toán', 'atm'], ko: ['현금', '카드', '결제', 'atm'], ja: ['現金', 'カード', '支払', 'atm'] },
  kids: { en: ['kids', 'children', 'child', 'family friendly', 'toddler', 'for my son', 'for my daughter'], zh: ['孩子', '儿童', '小孩', '亲子'], vi: ['trẻ em', 'trẻ con', 'con nít', 'gia đình'], ko: ['아이', '어린이', '아동', '가족'], ja: ['子ども', '子供', 'キッズ', '家族'] },
  lang: { en: ['speak chinese', 'in chinese', 'speak vietnamese', 'speak korean', 'speak japanese', 'change language', 'switch language', 'other language'], zh: ['切换语言', '换语言', '英文', '说英语'], vi: ['đổi ngôn ngữ', 'tiếng anh', 'tiếng trung'], ko: ['언어 변경', '언어를 바꾸', '영어로'], ja: ['言語を変え', '言語切替', '英語で'] },
  schedule: { en: ['schedule', 'program', 'performance', 'performances', 'show', 'event', 'events', 'activities', 'what is on', "what's on", 'what is happening', 'happening', 'lineup', 'workshop', 'when does', 'what time is'], zh: ['日程', '节目', '演出', '活动', '表演', '什么活动', '有什么', '工作坊', '几点开始'], vi: ['lịch trình', 'chương trình', 'biểu diễn', 'hoạt động', 'có gì', 'lớp', 'mấy giờ diễn'], ko: ['일정', '프로그램', '공연', '행사', '뭐 해', '뭐가 있', '워크숍', '몇 시에'], ja: ['スケジュール', 'プログラム', '公演', '催し', 'イベント', '何がある', '何があります', '教室', 'ワークショップ', '何時から'] },
  vendor: { en: ['vendor', 'vendors', 'booth', 'stall', 'where can i buy', 'where can i get', 'where can i eat', 'sell', 'sells', 'shop', 'store', 'food', 'eat', 'drink', 'buy', 'souvenir', 'gift'], zh: ['商户', '摊位', '哪里买', '哪里有', '哪里吃', '卖', '店', '吃', '喝', '礼物', '纪念品'], vi: ['gian hàng', 'quầy', 'mua ở đâu', 'ăn ở đâu', 'bán', 'cửa hàng', 'ăn', 'uống', 'quà'], ko: ['업체', '부스', '어디서 사', '어디서 먹', '파는', '가게', '먹', '마실', '기념품', '선물'], ja: ['出店', 'ブース', '屋台', 'どこで買', 'どこで食べ', '売って', '店', '食べ', '飲み', 'お土産', 'ギフト'] },
}

const DAY_KW = {
  day1: { en: ['friday', 'fri', 'feb 5', 'february 5', 'day 1', 'day one', 'first day', 'eve', '5th'], zh: ['周五', '星期五', '5日', '除夕', '第一天'], vi: ['thứ sáu', 'thứ 6', '5/2', 'ngày 5', 'giao thừa', 'ngày đầu'], ko: ['금요일', '금요', '5일', '섣달', '첫날', '첫째 날'], ja: ['金曜', '5日', '大晦日', '初日', '1日目'] },
  day2: { en: ['saturday', 'sat', 'feb 6', 'february 6', 'day 2', 'day two', 'second day', "new year's day", '6th'], zh: ['周六', '星期六', '6日', '初一', '第二天'], vi: ['thứ bảy', 'thứ 7', '6/2', 'ngày 6', 'mùng 1', 'ngày thứ hai'], ko: ['토요일', '토요', '6일', '설날 당일', '둘째 날', '이튿날'], ja: ['土曜', '6日', '元日', '2日目'] },
}
const STAGE_KW = {
  main: { en: ['main stage', 'stage'], zh: ['主舞台', '舞台'], vi: ['sân khấu'], ko: ['메인 무대', '무대'], ja: ['メインステージ', 'ステージ', '舞台'] },
  pavilion: { en: ['pavilion', 'cultural pavilion'], zh: ['文化馆'], vi: ['nhà văn hóa'], ko: ['문화관'], ja: ['パビリオン', '文化館'] },
  food: { en: ['food hall', 'food area'], zh: ['美食区'], vi: ['khu ẩm thực'], ko: ['푸드홀', '음식 구역'], ja: ['フードホール'] },
  garden: { en: ['family garden', 'garden', 'kids area'], zh: ['亲子园'], vi: ['vườn gia đình'], ko: ['가족 정원'], ja: ['ファミリーガーデン', 'ガーデン'] },
  market: { en: ['market'], zh: ['市集', '年货'], vi: ['chợ'], ko: ['장터', '마켓'], ja: ['マーケット', '市場'] },
}
const TYPE_KW = {
  performance: { en: ['performance', 'performances', 'dance', 'show', 'music', 'opera', 'concert'], zh: ['演出', '表演', '舞蹈', '音乐'], vi: ['biểu diễn', 'múa', 'ca nhạc'], ko: ['공연', '춤', '음악'], ja: ['公演', 'ダンス', '踊り', '音楽', 'ショー'] },
  food: { en: ['food', 'cooking', 'cook', 'tasting', 'eat'], zh: ['美食', '烹饪', '品尝', '吃'], vi: ['ẩm thực', 'nấu', 'thưởng thức', 'ăn'], ko: ['음식', '요리', '시식', '먹'], ja: ['食', '料理', '試食', '食べ'] },
  culture: { en: ['culture', 'cultural', 'calligraphy', 'tea', 'paper', 'exhibition', 'talk', 'workshop'], zh: ['文化', '书法', '茶', '剪纸', '展览', '讲座'], vi: ['văn hóa', 'thư pháp', 'trà', 'cắt giấy', 'triển lãm'], ko: ['문화', '서예', '차', '전지', '전시', '강연'], ja: ['文化', '書道', '茶', '切り紙', '展示', 'トーク'] },
  family: { en: ['family', 'kids', 'children', 'games', 'craft', 'crafts', 'photo', 'lantern'], zh: ['亲子', '儿童', '游戏', '手工', '拍照', '花灯', '灯笼'], vi: ['gia đình', 'trẻ em', 'trò chơi', 'thủ công', 'chụp ảnh', 'đèn lồng'], ko: ['가족', '어린이', '놀이', '만들기', '사진', '등불'], ja: ['ファミリー', '子ども', '遊び', '工作', '写真', '提灯'] },
}
const CAT_KW = {
  food: { en: ['food', 'eat', 'drink', 'snack', 'restaurant'], zh: ['美食', '吃', '喝', '小吃', '餐厅'], vi: ['ẩm thực', 'ăn', 'uống', 'đồ ăn'], ko: ['음식', '먹', '마실', '간식'], ja: ['食', '食べ', '飲み', '軽食'] },
  crafts: { en: ['craft', 'crafts', 'handmade', 'art', 'souvenir', 'gift', 'jewelry', 'clothing'], zh: ['手工', '工艺', '礼物', '纪念品', '首饰', '衣服'], vi: ['thủ công', 'quà', 'trang sức', 'quần áo'], ko: ['공예', '수공예', '선물', '기념품', '장신구', '옷'], ja: ['工芸', '手作り', 'お土産', 'ギフト', 'アクセサリー', '服'] },
  cultural: { en: ['cultural', 'organization', 'school', 'class', 'lesson', 'library', 'community'], zh: ['文化', '机构', '学校', '课', '图书馆', '社区'], vi: ['văn hóa', 'tổ chức', 'trường', 'lớp', 'thư viện', 'cộng đồng'], ko: ['문화', '단체', '학교', '수업', '도서관', '커뮤니티'], ja: ['文化', '団体', '学校', '教室', '図書館', 'コミュニティ'] },
}

const STOP = new Set(['the', 'and', 'for', 'with', 'what', 'where', 'when', 'which', 'there', 'this', 'that', 'about', 'from', 'have', 'does', 'will', 'can', 'any', 'are', 'you', 'your', 'show', 'tell', 'find', 'want', 'like', 'need', 'some', 'get', 'buy', 'sell', 'sells', 'workshop', 'festival', 'new', 'year', 'lunar', 'chinese', 'event', 'events'])

for (const [code, locale] of Object.entries(extraLocales)) {
  for (const [table, key] of [[KW, 'intentKeywords'], [DAY_KW, 'dayKeywords'], [STAGE_KW, 'stageKeywords'], [TYPE_KW, 'typeKeywords'], [CAT_KW, 'categoryKeywords']]) {
    for (const [intent, keywords] of Object.entries(locale[key])) table[intent][code] = keywords
  }
}

// ---------- helpers ----------
export function hasKeyword(q, keyword) {
  const k = normalize(keyword)
  if (!k) return false
  if (/^[\p{Script=Latin}\p{M}\d\s'’-]+$/u.test(k)) {
    const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?:s|es|ing|ed)?(?![\\p{L}\\p{N}])`, 'u').test(q)
  }
  // CJK/Thai words and Korean stems attach to particles; keep substring matching.
  return q.includes(k)
}
function hasAny(q, list) { return list.some((k) => hasKeyword(q, k)) }
function anyLang(q, table) { return CHAT_LANGS.some((l) => hasAny(q, table[l] || [])) }
function matchKey(q, table) {
  for (const [key, langs] of Object.entries(table)) if (anyLang(q, langs)) return key
  return null
}

/** How strongly a query mentions a multilingual text object {en,zh,...}. Latin: whole words >= 4 chars; CJK: 2-grams. */
export function mentionScore(q, textObj) {
  let score = 0
  for (const lang of CHAT_LANGS) {
    const text = textObj?.[lang]
    if (!text) continue
    if (['zh', 'zh-Hant', 'ja', 'ko'].includes(lang)) {
      // Hanzi/kanji, katakana, and hangul only: hiragana particles and verb
      // endings (は, が, ます) would otherwise match almost any sentence, and
      // Korean particles glue onto nouns (만두는), so 2-grams beat whole words.
      const t = text.replace(/[^゠-ヿ一-鿿가-힯]/g, '')
      const seen = new Set()
      for (let i = 0; i + 2 <= t.length; i++) { const g = t.slice(i, i + 2); if (!seen.has(g) && q.includes(g)) { seen.add(g); score += 1 } }
    } else {
      for (const w of normalize(text).split(/[^\p{L}\p{N}]+/u)) {
        if (w.length >= 3 && !STOP.has(w) && hasKeyword(q, w)) score += 1
      }
    }
  }
  return score
}

function fmtTime(hhmm) { return hhmm }
function scheduleLine(it, lang, L) {
  return `• ${L.day[it.day]} ${fmtTime(it.start)}–${fmtTime(it.end)} · ${it.title[lang] ?? it.title.en} (${event.stages[it.stage][lang] ?? event.stages[it.stage].en})`
}
function vendorLine(v, lang, L) {
  return `• ${v.name[lang] ?? v.name.en} · ${L.booth} ${v.booth} · ${v.description[lang] ?? v.description.en}`
}

function findScheduleItems(q) {
  const day = matchKey(q, DAY_KW)
  const stage = matchKey(q, STAGE_KW)
  const type = matchKey(q, TYPE_KW)
  const scored = schedule.items.map((it) => ({ it, s: mentionScore(q, it.title) + 0.5 * mentionScore(q, it.description) }))
  const maxS = Math.max(...scored.map((x) => x.s))
  let items = schedule.items
  if (maxS >= 1) items = scored.filter((x) => x.s >= Math.max(1, maxS - 0.5)).map((x) => x.it)
  if (day) items = items.filter((it) => it.day === day)
  if (stage) items = items.filter((it) => it.stage === stage)
  // A named activity is more specific than broad category words in its title.
  if (type && maxS < 1) items = items.filter((it) => it.type === type)
  const specific = maxS >= 1 || day || stage || type
  return { items: items.slice().sort((a, b) => (a.day === b.day ? a.start.localeCompare(b.start) : a.day.localeCompare(b.day))), specific, filters: { day, stage, type: maxS < 1 ? type : null } }
}

function findVendors(q) {
  const cat = matchKey(q, CAT_KW)
  const scored = vendors.items.map((v) => ({ v, s: mentionScore(q, v.name) + mentionScore(q, v.description) }))
  const maxS = Math.max(...scored.map((x) => x.s))
  let items = vendors.items
  if (maxS >= 1) items = scored.filter((x) => x.s >= Math.max(1, maxS - 0.5)).map((x) => x.v)
  if (cat) items = items.filter((v) => v.category === cat)
  return { items, specific: maxS >= 1 || !!cat, cat }
}

function knowledgeTopic(q) {
  let best = null, bestScore = 0
  for (const t of knowledge.topics) {
    let s = 0
    for (const lang of CHAT_LANGS) for (const k of t.keywords[lang] || []) if (hasKeyword(q, k)) s += k.length >= 8 ? 3 : k.length >= 4 ? 2 : 1
    if (s > bestScore) { best = t; bestScore = s }
  }
  return bestScore > 0 ? best : null
}

// ---------- main ----------
export function answer(rawText, { lang: uiLang = 'en', now = new Date() } = {}) {
  const text = String(rawText ?? '').trim()
  const lang = detectLang(text, uiLang)
  const L = T[lang]
  const q = normalize(text)
  const reply = (intent, body, links = []) => ({ text: ['schedule', 'vendors'].includes(intent) ? chatLinkCopy[lang].preliminary + '\n' + body : body, lang, intent, links })
  const scheduleParams = (f) => { const p = new URLSearchParams(); if (f.day) p.set('day', f.day); if (f.stage) p.set('stage', f.stage); if (f.type) p.set('type', f.type); const s = p.toString(); return s ? `/schedule?${s}` : '/schedule' }

  const topic = knowledgeTopic(q)
  const sched = findScheduleItems(q)
  const vend = findVendors(q)
  const namesVendor = vend.specific && vend.items.length > 0 && vendorScoreMax(q, vend.items) >= 1
  const namesEvent = sched.specific && sched.items.length > 0 && mentionScoreMax(q, sched.items) >= 1
  const festivalReference = anyLang(q, {
    en: ['festival', 'event', 'mccc', 'agricenter'], zh: ['庆典', '活动', '文化节'],
    'zh-Hant': ['慶典', '活動', '文化節'], vi: ['lễ hội', 'sự kiện'], ko: ['축제', '행사'], ja: ['祭り', 'イベント'], th: ['เทศกาล', 'งาน'],
  })
  const addressReference = anyLang(q, {
    en: ['address', 'venue', 'directions'], zh: ['地址', '会场'], 'zh-Hant': ['地址', '會場'],
    vi: ['địa chỉ'], ko: ['주소', '행사장'], ja: ['住所', '会場'], th: ['ที่อยู่', 'สถานที่จัดงาน'],
  })
  const locationQuestion = anyLang(q, KW.location) || addressReference || /\bwhere\b/u.test(q) && festivalReference
  const wholeFestivalLocation = locationQuestion && (
    addressReference && festivalReference ||
    festivalReference && !sched.filters.stage ||
    addressReference && !namesVendor && !namesEvent && !sched.filters.stage
  )
  if (wholeFestivalLocation) return reply('venue', `${event.venue.name[lang] ?? event.venue.name.en}\n${event.venue.address}`, [{ to: '/visit', label: L.visit }])

  if (!q) return reply('greet', L.hello)
  if (q.length < 25 && anyLang(q, KW.greet)) return reply('greet', L.hello)
  if (anyLang(q, KW.lang)) return reply('lang', L.langHint)

  // "What's on now?"
  if (anyLang(q, KW.now) && !anyLang(q, KW.vendor)) {
    const st = getEventState(event, now)
    if (st.state !== 'open') return reply('now', L.nowClosed, [{ to: '/schedule', label: L.more }])
    const day = event.days.find((d) => d.id === st.day)
    const t = now.getTime()
    const running = schedule.items.filter((it) => it.day === day.id && festivalDate(day.date, it.start, event.timezone).getTime() <= t && festivalDate(day.date, it.end, event.timezone).getTime() > t)
    const upcoming = schedule.items.filter((it) => it.day === day.id && festivalDate(day.date, it.start, event.timezone).getTime() > t).sort((a, b) => a.start.localeCompare(b.start)).slice(0, 3)
    const lines = []
    if (running.length) lines.push(L.nowOpen(running.length), ...running.map((it) => scheduleLine(it, lang, L)))
    if (upcoming.length) lines.push(L.nowNext, ...upcoming.map((it) => scheduleLine(it, lang, L)))
    return reply('now', lines.join('\n'), [{ to: `/schedule?day=${day.id}`, label: L.more }])
  }

  // Knowledge topics win when the question is clearly about traditions.
  const wantsSchedule = anyLang(q, KW.schedule) || sched.filters.day || sched.filters.stage || (anyLang(q, KW.hours) && mentionScoreMax(q, sched.items) >= (['zh', 'zh-Hant', 'ja', 'ko'].includes(lang) ? 1 : 2))
  const wantsVendor = anyLang(q, KW.vendor) || vend.cat || namesVendor && anyLang(q, KW.tickets)

  // Direct FAQ-style intents.
  if (anyLang(q, KW.accessibility)) return reply('accessibility', L.accessibility, [{ to: '/visit', label: L.visit }])
  if (anyLang(q, KW.volunteer)) return reply('volunteer', externalLink(event.links.volunteerForm, 'volunteerForm') ? L.volunteer : chatLinkCopy[lang].volunteer, [{ to: '/get-involved#volunteer', label: L.involved }])
  if (anyLang(q, KW.sponsor)) return reply('sponsor', L.sponsor, [{ to: '/get-involved#sponsor', label: L.involved }])
  if (anyLang(q, KW.vendorApply)) return reply('vendorApply', externalLink(event.links.vendorForm, 'vendorForm') ? L.vendorApply : chatLinkCopy[lang].vendorApply, [{ to: '/get-involved#vendor', label: L.involved }])
  if (anyLang(q, KW.tickets) && !wantsSchedule && !namesVendor) return reply('tickets', externalLink(event.links.tickets, 'tickets') ? L.tickets : chatLinkCopy[lang].tickets, [{ to: '/visit', label: L.visit }])
  if (anyLang(q, KW.weather)) return reply('weather', L.weather, [{ to: '/visit', label: L.visit }])
  if (anyLang(q, KW.payment)) return reply('payment', L.payment)
  if (anyLang(q, KW.location) && !wantsSchedule && !namesVendor && !namesEvent) return reply('location', L.location, [{ to: '/visit', label: L.visit }])

  // Specific schedule or vendor lookups beat general knowledge when the
  // query names an item, a day, an area, or a category.
  if (sched.specific && (!wantsVendor || wantsSchedule) && (wantsSchedule || !topic || locationQuestion && namesEvent || mentionScoreMax(q, sched.items) >= 3)) {
    if (!sched.items.length) return reply('schedule', L.schedNone, [{ to: '/schedule', label: L.more }])
    const top = sched.items.slice(0, 6)
    return reply('schedule', [L.schedIntro(sched.items.length), ...top.map((it) => scheduleLine(it, lang, L))].join('\n'), [{ to: scheduleParams(sched.filters), label: L.more }])
  }
  if (vend.specific && (wantsVendor || !topic || vendorScoreMax(q, vend.items) >= 3)) {
    if (!vend.items.length) return reply('vendors', L.vendNone, [{ to: '/vendors', label: L.moreVendors }])
    const top = vend.items.slice(0, 5)
    return reply('vendors', [L.vendIntro(vend.items.length), ...top.map((v) => vendorLine(v, lang, L))].join('\n'), [{ to: vend.cat ? `/vendors?cat=${vend.cat}` : '/vendors', label: L.moreVendors }])
  }
  if (topic) return reply(`topic:${topic.id}`, topic.answer[lang] ?? topic.answer.en, [{ to: '/about#traditions', label: L.about }])
  if (anyLang(q, KW.kids)) return reply('kids', L.kids, [{ to: '/schedule?type=family', label: L.more }])
  if (anyLang(q, KW.hours)) return reply('hours', L.hours, [{ to: '/visit', label: L.visit }])
  if (wantsSchedule) {
    const top = sched.items.slice(0, 6)
    return reply('schedule', [L.schedIntro(sched.items.length), ...top.map((it) => scheduleLine(it, lang, L))].join('\n'), [{ to: '/schedule', label: L.more }])
  }
  if (wantsVendor) {
    const top = vend.items.slice(0, 5)
    return reply('vendors', [L.vendIntro(vend.items.length), ...top.map((v) => vendorLine(v, lang, L))].join('\n'), [{ to: '/vendors', label: L.moreVendors }])
  }
  return reply('fallback', L.fallback, [{ to: '/schedule', label: L.more }, { to: '/vendors', label: L.moreVendors }])
}

function mentionScoreMax(q, items) { return Math.max(0, ...items.map((it) => mentionScore(q, it.title))) }
function vendorScoreMax(q, items) { return Math.max(0, ...items.map((v) => mentionScore(q, v.name) + mentionScore(q, v.description))) }

export { SUGGESTIONS, HELLO } from './chatStrings.js'
