import { useState } from 'react';
import SEOHead from '@/components/seo/SEOHead';
import { Mail, Phone, MapPin, Clock, ChevronDown, ChevronUp } from 'lucide-react';

const CONTACT_INFO = [
  {
    icon: Mail,
    label: 'Email',
    value: 'contact@helpmeclean.ro',
    href: 'mailto:contact@helpmeclean.ro',
  },
  {
    icon: Phone,
    label: 'Telefon',
    value: '+40 700 000 000',
    href: 'tel:+40700000000',
  },
  {
    icon: MapPin,
    label: 'Oraș',
    value: 'București, România',
    href: undefined,
  },
  {
    icon: Clock,
    label: 'Program',
    value: 'Luni–Vineri, 9:00–18:00',
    href: undefined,
  },
];

const SUBJECTS = [
  'Suport client',
  'Parteneriat firmă',
  'Presă',
  'Altele',
];

const FAQS = [
  {
    question: 'Când se lansează platforma?',
    answer:
      'HelpMeClean se află în faza de pre-lansare. Ne pregătim să deschidem platforma în curând, începând cu București. Înscrie-te pe lista de așteptare pentru a primi acces prioritar și notificări despre lansare.',
  },
  {
    question: 'Cum mă înregistrez ca firmă de curățenie?',
    answer:
      'Poți aplica ca firmă parteneră prin pagina "Pentru Firme". Ai nevoie de un CUI valid, asigurare civilă și documentele firmei. Procesul de verificare durează maxim 48 de ore, după care contul tău va fi activat.',
  },
  {
    question: 'Cum funcționează verificarea firmelor?',
    answer:
      'Fiecare firmă parteneră trece printr-un proces de verificare a documentelor (certificat de înregistrare, asigurare civilă, CUI). Verificăm activ identitatea și documentele pentru a garanta că clienții noștri lucrează doar cu profesioniști de încredere.',
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: SUBJECTS[0],
    message: '',
  });
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = encodeURIComponent(
      `Nume: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`,
    );
    const subject = encodeURIComponent(`[HelpMeClean] ${formData.subject}`);
    window.location.href = `mailto:contact@helpmeclean.ro?subject=${subject}&body=${body}`;
  }

  return (
    <>
      <SEOHead
        title="Contact | HelpMeClean.ro"
        description="Contactează echipa HelpMeClean pentru suport, parteneriate sau întrebări despre platforma de curățenie din România."
        canonicalUrl="/contact"
      />
      <div className="bg-white">
        {/* Header */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16 px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">Contactează-ne</h1>
            <p className="text-blue-100 text-lg">
              Suntem aici să te ajutăm. Scrie-ne și îți răspundem în cel mult o zi lucrătoare.
            </p>
          </div>
        </section>

        {/* Contact grid */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
            {/* Left: Contact info */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Informații de contact</h2>
              <div className="space-y-5">
                {CONTACT_INFO.map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-sm transition">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
                      {href ? (
                        <a href={href} className="text-gray-900 font-medium hover:text-blue-600 transition">
                          {value}
                        </a>
                      ) : (
                        <p className="text-gray-900 font-medium">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Contact form */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Trimite un mesaj</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nume complet
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Ion Popescu"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Adresă email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                    placeholder="ion@exemplu.ro"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Subiect
                  </label>
                  <select
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData((f) => ({ ...f, subject: e.target.value }))}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Mesaj
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData((f) => ({ ...f, message: e.target.value }))}
                    placeholder="Cum te putem ajuta?"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Trimite mesajul
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-gray-50 py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              Întrebări frecvente
            </h2>
            <div className="space-y-4">
              {FAQS.map(({ question, answer }, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left focus:outline-none cursor-pointer"
                  >
                    <span className="font-semibold text-gray-900">{question}</span>
                    {openFaq === idx ? (
                      <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === idx && (
                    <div className="px-6 pb-5">
                      <p className="text-gray-600 text-sm leading-relaxed">{answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
