import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function OnboardSuccessPage() {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <CheckCircle size={32} className="text-green-600" strokeWidth={1.8} />
      </div>
      <h1 className="mb-2 text-2xl font-semibold text-gray-900">You're all set!</h1>
      <p className="mb-6 max-w-md text-sm text-gray-600">
        Thank you for completing your pre-arrival information. Your property manager will be in touch
        shortly to confirm your activities and any additional details.
      </p>
      <div className="rounded-lg border border-gray-200 bg-white p-5 text-left text-sm text-gray-700 max-w-sm w-full">
        <p className="font-medium text-gray-900 mb-2">What happens next?</p>
        <ul className="space-y-1.5 text-xs text-gray-600">
          <li>· Your property manager reviews your selections</li>
          <li>· Activity bookings are confirmed and scheduled</li>
          <li>· You'll receive a welcome pack before arrival</li>
          <li>· Any questions? Contact Jamie at <a href="mailto:mgl365management@gmail.com" className="text-[#1f5772] underline">mgl365management@gmail.com</a> or <a href="tel:+12687885675" className="text-[#1f5772] underline">+1-268-788-5675</a></li>
        </ul>
      </div>
    </div>
  )
}
