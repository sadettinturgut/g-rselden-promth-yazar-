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
            text: "Bu resmi analiz et ve başka bir yapay zeka görsel oluşturucu (Midjourney, Stable Diffusion vb.) için son derece detaylı bir prompt oluştur. Çıktıyı belirtilen kategorilere ayırarak Türkçe olarak ver. Fotoğrafçı kimliği (selfie mi yoksa başkası mı?), kameranın öznenin tam olarak neresinde durduğu, öznenin kadrajı ne kadar doldurduğu (komple vücut mu, sadece gözler mi?), kamera yüksekliği, çekim açısı, üç çeyrek açı durumu, kadraj tipi, perspektif, duruş tipi, gövde ve baş yönü, omuz üzerinden bakış, vücut yön farkları ve el pozisyonu gibi teknik fotoğraf ve poz terimlerini asla atlama. Kıyafet bölümünde yapay zeka görsel üreticilerinin sansürlediği/izin vermediği kelimeleri (külot, tanga, iç çamaşırı vb.) kesinlikle kullanma; bunların yerine güvenli ve moda odaklı alternatif terimler kullan. Eğer görselde türban veya başörtüsü varsa bağlama şeklini, kıvrımlarını ve duruşunu çok detaylı betimle.",
          },
        ],
      },
    ],
    config: {
      systemInstruction: `Sen profesyonel bir görsel betimleme uzmanı, fotoğrafçı ve poz koçusun. Kullanıcının yüklediği görseli en ince detayına kadar analiz edip, benzer bir görsel üretmek için gereken mükemmel promptu hazırlarsın. 
      
      Yanıtını teknik fotoğrafçılık ve pozlama terimleri kullanarak şu başlıklar altında detaylandır:
      
      1. Kamera, Kadraj & Pozisyon (kameraVeKadraj):
      - Fotoğrafçı Kimliği: (Özne kendi selfiesini mi çekiyor yoksa bir başkası mı?)
      - Kameranın Özneye Göre Konumu: (Kamera öznenin tam karşısında mı, sağ/sol çaprazında mı, arkasında mı, yan tarafında mı, üstünde mi veya altında mı duruyor? Öznenin hangi noktasına hizalanmış?)
      - Kadraj Doluluğu: (Özne kadrajı ne kadar dolduruyor? Komple vücut mu, üst gövde mi, sadece yüz mü yoksa sadece gözler gibi makro bir detay mı? Öznenin kadrajdaki baskınlığı.)
      - En-boy oranı (örneğin 9:16, 16:9, 1:1 kare vb. --ar parametresi olarak da eklenebilir).
      - Tahmini Ölçüler: (Genişlik x Yükseklik, örneğin 1080x1920px).
      - Kadraj Durumu: Dikey/yatay/kare durumu, kompozisyon kuralları (üçte bir kuralı vb.) ve çerçeveleme detayları.
      - Kamera Yüksekliği: (Göz hizası, diz hizası, yer seviyesi, baş üstü vb.)
      - Çekim Açısı: (High-angle, low-angle, Dutch angle, bird's eye vb.)
      - Üç Çeyrek Açı (Three-Quarter View): Öznenin kameraya göre dönüş açısı.
      - Perspektif: (Tek noktalı perspektif, geniş açı distorsiyonu, telefoto sıkıştırması vb.)
      - Kadraj Tipi / Shot Type: (Extreme close-up, close-up, medium shot, American shot, full shot, wide shot vb.)
      - Öznenin kameraya olan uzaklığı.
      
      2. Vücut (vucutDurusu):
      - Duruş Tipi: (Ayakta, oturma, yaslanma, kontrapost/contrapposto, dinamik hareket vb.)
      - Gövde Yönü: (Kameraya tam dönük, profilden, 45 derece açılı vb.)
      - Baş Yönü: (Tilt, turn, chin up/down detayları).
      - Yüz İfadesi: Bakış yönü, duygusal durum, dudak ve göz çevresi detayları.
      - El Pozisyonu: (Ellerin etkileşimi, yüze yakınlık, ceplerde, serbest döküm vb.)
      
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
