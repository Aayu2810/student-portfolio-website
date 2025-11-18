 import { FileCheck, Shield, Share2, Zap } from "lucide-react"

export default function Features() {
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-purple-500" />,
      title: "Secure Storage",
      description: "Store all your academic documents in one encrypted, secure location with faculty verification."
    },
    {
      icon: <FileCheck className="w-8 h-8 text-purple-500" />,
      title: "Faculty Verification",
      description: "Get your certificates, internships, and projects verified by faculty with digital signatures."
    },
    {
      icon: <Share2 className="w-8 h-8 text-purple-500" />,
      title: "Easy Sharing",
      description: "Generate shareable portfolio links with time-limited access and QR codes for recruiters."
    },
    {
      icon: <Zap className="w-8 h-8 text-purple-500" />,
      title: "Auto Portfolio",
      description: "Automatically generate professional portfolios from your verified documents for placements."
    }
  ]

  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything you need for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-300 dark:to-orange-200">
              document management
            </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Designed specifically for students and academic institutions
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 hover:shadow-xl transition-all duration-300"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}