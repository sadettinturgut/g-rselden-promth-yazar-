import { GoogleGenAI, Type } from "@google/genai";
import { PromptResult } from "../types";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function analyzeImage(base64Image: string, mimeType: string): Promise<PromptResult> {
  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: base64Image.split(",")[1],
              mimeType: mimeType,
            },
          },
          {
            text: "Bu resmi analiz et ve başka bir yapay zeka görsel oluşturucu (Midjourney, Stable Diffusion vb.) için son derece detaylı bir prompt oluştur. Çıktıyı belirtilen kategorilere ayırarak Türkçe olarak ver. Özellikle 'Kamera, Kadraj & Pozisyon' bölümünde kadrajın sınırlarını (vücudun tam olarak hangi noktasından kesildiği, baş üstü ve yan boşluklar) ve öznenin kadraj içindeki vücut pozunu hiçbir yoruma yer bırakmayacak kadar KESİN, NET ve ÖLÇÜLÜ bir şekilde tarif et. Fotoğrafçı kimliği (selfie mi yoksa başkası mı?), kameranın öznenin tam olarak neresinde durduğu, öznenin kadrajı ne kadar doldurduğu, kamera yüksekliği, çekim açısı, üç çeyrek açı durumu, kadraj tipi, perspektif, duruş tipi, gövde ve baş yönü, omuz üzerinden bakış, vücut yön farkları ve el pozisyonu gibi teknik fotoğraf ve poz terimlerini asla atlama. Kıyafet bölümünde yapay zeka görsel üreticilerinin sansürlediği/izin vermediği kelimeleri (külot, tanga, iç çamaşırı vb.) kesinlikle kullanma; bunların yerine güvenli ve moda odaklı alternatif terimler kullan. Eğer görselde türban veya başörtüsü varsa bağlama şeklini, kıvrımlarını ve duruşunu çok detaylı betimle.",
          },
        ],
      },
    ],
    config: {
      systemInstruction: `Sen profesyonel bir görsel betimleme uzmanı, fotoğrafçı ve poz koçusun. Kullanıcının yüklediği görseli en ince detayına kadar analiz edip, benzer bir görsel üretmek için gereken mükemmel promptu hazırlarsın. 
      
      Yanıtını teknik fotoğrafçılık ve pozlama terimleri kullanarak şu başlıklar altında detaylandır:
      
      1. Kamera, Kadraj & Pozisyon (kameraVeKadraj):
      - KESİN KADRAJ SINIRLARI: Kadrajın alt, üst, sağ ve sol sınırlarının özneyi tam olarak nereden kestiğini net olarak belirt (Örn: "Kadrajın alt sınırı tam olarak uyluk ortasından / diz kapağının 5 cm üstünden / bel oyuğundan / göğüs altından kesiliyor; başın üstünde kadrajın %10'u kadar boşluk (headroom) var; özne kadrajın tam merkezinde / hafif sağ üçte birlik çizgisinde yer alıyor").
      - KADRAJ İÇİNDEKİ KESİN VÜCUT POZU: Öznenin kameraya ve kadraja göre vücut pozisyonunu milimetrik bir netlikle tarif et (Örn: "Vücut kameraya 45 derece sola dönükken baş doğrudan objektife çevrilmiş, ağırlık sağ bacakta, sol kalça hafif dışarı çıkarılmış (S-eğrisi), sağ omuz sol omuzdan daha aşağıda, sırt hafif geriye yaslanmış, kolların ve bacakların kadraj içindeki tam açıları ve doğrultusu").
      - Fotoğrafçı Kimliği: (Özne kendi selfiesini mi çekiyor yoksa bir başkası mı? Selfie ise hangi eliyle telefonu tuttuğu veya ayna karşısında olup olmadığı.)
      - Kameranın Özneye Göre Konumu: (Kamera öznenin tam karşısında mı, sağ/sol çaprazında mı, arkasında mı, yan tarafında mı, üstünde mi veya altında mı duruyor? Öznenin tam olarak hangi vücut noktasına hizalanmış?)
      - Kadraj Doluluğu ve Çekim Planı (Shot Type): (Özne kadrajın yüzde kaçını dolduruyor? Extreme close-up, close-up, medium close-up, medium shot, cowboy/American shot, full body shot veya wide shot olduğunu kesin olarak yaz.)
      - En-boy Oranı ve Tahmini Ölçüler: (Örn: 9:16 dikey format, 1080x1920px veya 4:5 portre vb.)
      - Kamera Yüksekliği, Çekim Açısı ve Perspektif: (Göz hizası, göğüs hizası, bel/kalça hizası, yer seviyesi; High-angle, low-angle, eye-level; lens odak uzaklığı hissi ve perspektif derinliği.)
      - Öznenin Kameraya Olan Mesafesi: (Örn: yaklaşık 1 metre yakın mesafe, 2-3 metre orta mesafe vb.)
      
      2. Vücut (vucutDurusu):
      - Duruş Tipi ve Anatomik Poz: (Ayakta, oturma, yaslanma, uzanma, kontrapost/contrapposto, dinamik hareket vb. Vücut ağırlığının dağılımı ve omurga hattı.)
      - Gövde, Omuz ve Kalça Yönü: (Gövdenin kameraya açısı, omuzların eğimi ve kalça duruşu arasındaki açı farkları.)
      - Baş Yönü ve Boyun Açısı: (Başın sağa/sola dönüşü, yana eğimi/tilt, çenenin yukarı/aşağı duruşu.)
      - Yüz İfadesi ve Bakış: (Bakışların tam hedefi - doğrudan lense mi, kamera dışına mı -, göz kapaklarının açıklığı, kaş ve dudak duruşu, duygu durumu.)
      - Kol ve El Pozisyonu: (Her iki kolun dirsekten kırılma açısı, ellerin tam olarak nerede olduğu ve neye temas ettiği - saçta, belde, yüzde, cepte, zemine dayalı vb. - parmakların duruşu.)
      - Bacak ve Ayak Pozisyonu (Görünüyorsa): (Bacakların birbirine göre konumu, çapraz duruş, diz kırıklığı, adım atma hissi.)
      
      3. Kıyafet (kiyafetVeAksesuarlar):
      - ÖNEMLİ FİLTRE KURALI: Yapay zeka görsel oluşturucuların güvenlik filtrelerine takılan, izin verilmeyen kelimeleri (örneğin: külot, tanga, iç çamaşırı, sütyen, bikini altı vb.) KESİNLİKLE YAZMA. Bunların yerine yapay zekanın sorunsuz kabul edeceği "spor alt giyim", "yüksek bel şort kesim alt", "büstiyer", "plaj giyimi", "vücuda oturan alt parça" gibi güvenli ve estetik moda terimleri kullan.
      - Türban / Başörtüsü Detayları (Varsa): Eğer öznede türban, şal veya başörtüsü varsa bağlama şeklini en ince ayrıntısına kadar anlat (Kumaş cinsi: Medine ipeği, şifon, pamuklu, saten vb.; Bağlama tekniği: sıkı ve geleneksel mi yoksa gevşek ve modern dökümlü mü, içte bone görünüyor mu, yüzü nasıl çerçeveliyor, çene altı ve boyun kısmı tamamen kapalı mı yoksa boyun açıkta bırakan enseden bağlama mı, şalın uçları omuzlardan öne doğru mu sarkıyor yoksa arkaya mı atılmış, katmanları, kıvrımları ve iğneleme detayları nasıl?).
      - Diğer Kıyafet ve Aksesuarlar: Kumaş türü, kesim, desenler, dikiş detayları, yaka tipi, kol kesimi ve takılar/aksesuarlar.
      
      4. Saç & makyaj (sacVeMakyaj):
      - Saç stili (veya baş örtüsü altındaki duruş), rengi, dokusu; makyajın tarzı, renkleri, cilt dokusu.
      
      5. Ortam (konumVePozisyon):
      - Arka plan, mekanın detayları, nesnelerin yerleşimi, konum ve pozisyon.
      
      6. Işık (isiklandirma):
      - Işığın yönü (Rembrandt, butterfly, rim light vb.), sertliği, gölgeler, renk sıcaklığı.
      
      7. Atmosfer (atmosfer):
      - Genel ruh hali, renk paleti, ortamın hissi.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          sacVeMakyaj: { type: Type.STRING },
          kiyafetVeAksesuarlar: { type: Type.STRING },
          vucutDurusu: { type: Type.STRING },
          konumVePozisyon: { type: Type.STRING },
          isiklandirma: { type: Type.STRING },
          kameraVeKadraj: { type: Type.STRING },
          atmosfer: { type: Type.STRING },
        },
        required: [
          "sacVeMakyaj",
          "kiyafetVeAksesuarlar",
          "vucutDurusu",
          "konumVePozisyon",
          "isiklandirma",
          "kameraVeKadraj",
          "atmosfer",
        ],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("Analiz başarısız oldu.");
  return JSON.parse(text) as PromptResult;
}
