import { useState } from 'react'
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Info,
  Camera,
  Layers,
  CheckCircle
} from 'lucide-react'

import './Panduan.css'

const panduanData = [
  {
    title: 'Tentang PATTERNA',
    icon: <Info size={18} />,
    type: 'tentang',
    content:
      'PATTERNA adalah sistem klasifikasi kain berbasis citra tekstur menggunakan teknologi deep learning untuk mengenali jenis dan kualitas kain dari gambar close-up.'
  },

  {
    title: 'Mode Penggunaan',
    icon: <Layers size={18} />,
    type: 'mode'
  },

  {
    title: 'Cara Menggunakan Deteksi',
    icon: <CheckCircle size={18} />,
    type: 'cara'
  },

  {
    title: 'Tips Pengambilan Gambar',
    icon: <Camera size={18} />,
    type: 'tips'
  },

  {
    title: 'Rekomendasi Penggunaan Lensa',
    icon: <Camera size={18} />,
    type: 'lensa',
    content:
      'Sangat disarankan menggunakan lensa tambahan HP seperti Universal Clip Type 60x LED Microscope. Dataset sistem dikumpulkan menggunakan lensa tersebut dengan zoom HP sekitar 1.3x. Namun zoom normal 1x masih dapat digunakan selama gambar tetap fokus dan tidak terlalu jauh.'
  }
]

export default function Panduan() {
  const [openIndex, setOpenIndex] = useState(0)

  const toggleCard = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="panduan-page">
      <div className="container">

        <div className="panduan-header">
          <div className="panduan-title-wrap">

            <BookOpen size={34} color="var(--primary)" />

            <div>
              <h1 className="panduan-title">
                Panduan Penggunaan
              </h1>

              <p className="panduan-sub">
                Pelajari cara menggunakan sistem klasifikasi kain PATTERNA
                serta tips pengambilan gambar agar hasil deteksi lebih optimal.
              </p>
            </div>

          </div>
        </div>

        <div className="panduan-list">

          {panduanData.map((item, index) => {
            const isOpen = openIndex === index

            return (
              <div className="panduan-card" key={index}>

                <div
                  className="panduan-card-header"
                  onClick={() => toggleCard(index)}
                >

                  <div className="panduan-left">

                    <div className="panduan-icon">
                      {item.icon}
                    </div>

                    <h3>{item.title}</h3>

                  </div>

                  <button className="expand-btn">
                    {isOpen ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </button>

                </div>

                {isOpen && (
                  <div className="panduan-detail">

                    {/* Tentang */}
                    {item.type === 'tentang' && (
                      <p className="panduan-text">
                        {item.content}
                      </p>
                    )}

                    {/* Mode */}
                    {item.type === 'mode' && (
                      <div className="guide-list">

                        <div className="guide-item">
                          <div className="guide-bullet">1</div>

                          <div className="guide-text">
                            <strong>Mode Umum</strong><br />
                            Dapat digunakan tanpa login,
                            maksimal upload 1 gambar,
                            dan hasil klasifikasi tidak disimpan ke riwayat.
                          </div>
                        </div>

                        <div className="guide-item">
                          <div className="guide-bullet">2</div>

                          <div className="guide-text">
                            <strong>Mode Konveksi</strong><br />
                            Wajib login dan dapat mengupload hingga
                            50 gambar sekaligus serta menyimpan riwayat klasifikasi.
                          </div>
                        </div>

                        <div className="guide-item">
                          <div className="guide-bullet">3</div>

                          <div className="guide-text">
                            <strong>Riwayat</strong><br />
                            Fitur riwayat hanya tersedia setelah login,
                            baik akun umum maupun konveksi.
                          </div>
                        </div>

                      </div>
                    )}

                    {/* Cara */}
                    {item.type === 'cara' && (
                      <div className="guide-list">

                        <div className="guide-item">
                          <div className="guide-bullet">1</div>
                          <div className="guide-text">
                            Pilih mode penggunaan yang diinginkan.
                          </div>
                        </div>

                        <div className="guide-item">
                          <div className="guide-bullet">2</div>
                          <div className="guide-text">
                            Upload gambar kain atau gunakan kamera secara langsung.
                          </div>
                        </div>

                        <div className="guide-item">
                          <div className="guide-bullet">3</div>
                          <div className="guide-text">
                            Pastikan gambar fokus, jelas, dan tekstur kain terlihat.
                          </div>
                        </div>

                        <div className="guide-item">
                          <div className="guide-bullet">4</div>
                          <div className="guide-text">
                            Klik tombol klasifikasikan untuk memulai proses deteksi.
                          </div>
                        </div>

                        <div className="guide-item">
                          <div className="guide-bullet">5</div>
                          <div className="guide-text">
                            Sistem akan menampilkan hasil klasifikasi kain.
                          </div>
                        </div>

                      </div>
                    )}

                    {/* Tips */}
                    {item.type === 'tips' && (
                      <>
                        <div className="guide-list">

                          <div className="guide-item">
                            <div className="guide-bullet">✓</div>

                            <div className="guide-text">
                              Pastikan kain berada di tengah kamera agar
                              pola tekstur dapat terbaca dengan lebih stabil.
                            </div>
                          </div>

                          <div className="guide-item">
                            <div className="guide-bullet">✓</div>

                            <div className="guide-text">
                              Hindari gambar blur atau burem karena sistem membaca
                              detail serat kain dari tekstur close-up.
                            </div>
                          </div>

                          <div className="guide-item">
                            <div className="guide-bullet">✓</div>

                            <div className="guide-text">
                              Hindari cahaya terlalu terang, pantulan lampu,
                              atau kondisi terlalu gelap.
                            </div>
                          </div>

                          <div className="guide-item">
                            <div className="guide-bullet">✓</div>

                            <div className="guide-text">
                              Jangan terlalu zoom atau terlalu jauh agar
                              tekstur kain tetap terlihat jelas.
                            </div>
                          </div>

                        </div>

                        <div className="guide-highlight">
                          <h4>Tips Terbaik</h4>

                          <p>
                            Gunakan permukaan kain yang rata dan fokuskan kamera
                            sebelum mengambil gambar agar hasil klasifikasi lebih optimal.
                          </p>
                        </div>

                        <div className="guide-warning">
                          <h4>Hindari</h4>

                          <p>
                            Gambar yang terlalu blur, terlalu terang,
                            terlalu gelap, atau tekstur kain yang tidak terlihat
                            dapat menyebabkan hasil klasifikasi kurang akurat.
                          </p>
                        </div>
                      </>
                    )}

                    {/* Lensa */}
                    {item.type === 'lensa' && (
                      <>
                        <p className="panduan-text">
                          {item.content}
                        </p>

                        <div className="guide-highlight">
                          <h4>Rekomendasi</h4>

                          <p>
                            Penggunaan lensa tambahan microscope clip
                            dapat membantu menangkap detail tekstur kain
                            dengan lebih jelas sehingga sistem lebih mudah
                            mengenali pola serat kain.
                          </p>
                        </div>
                      </>
                    )}

                  </div>
                )}

              </div>
            )
          })}

        </div>
      </div>
    </div>
  )
}