'use client'

import { useState, useTransition, useCallback } from 'react'
import { submitOnboarding } from './actions'
import LiabilityWaiver from './LiabilityWaiver'

interface Activity {
  id: string
  name: string
  description: string | null
  price: number | null
  duration: string | null
  category: string
}

interface Booking {
  id: string
  check_in: string | null
  check_out: string | null
  onboarding_completed_at: string | null
  villas: { id: string; name: string } | null
  clients: { name: string; email: string | null; phone: string | null } | null
}

interface Props {
  token: string
  booking: Booking
  liabilityContent: string | null
  activities: Activity[]
}

const SERVICE_STEPS = [
  {
    interestKey: 'interest_spa',
    label: 'Spa Services',
    question: 'Would you be interested in any spa services during your stay?',
    description: 'In-villa treatments from our partner Healing Hands Spa.',
    category: 'Spa',
  },
  {
    interestKey: 'interest_tours',
    label: 'Water Activities',
    question: 'Would you be interested in booking any water activities?',
    description: 'Day charters, snorkelling, sunset cruises, and more via Barefoot Antigua.',
    category: 'Boat Tours',
  },
  {
    interestKey: 'interest_wine',
    label: 'Wine List',
    question: 'Would you like access to our curated wine list?',
    description: 'A selection of wines available to pre-order for your stay.',
    category: 'Wine',
  },
  {
    interestKey: 'interest_transport',
    label: 'Transport',
    question: 'Will you need any transport arrangements during your stay?',
    description: 'Airport transfers and car rental options.',
    category: 'Transport',
  },
  {
    interestKey: 'interest_chef',
    label: 'Private Chef',
    question: 'Would you like to arrange private chef services?',
    description: 'In-villa chef service for breakfast, lunch, dinner, or a special occasion.',
    category: 'Chef',
  },
  {
    interestKey: 'interest_provisioning',
    label: 'Provisioning',
    question: 'Would you like us to arrange grocery provisioning before your arrival?',
    description: 'We can stock the villa with groceries, drinks, and essentials before you arrive.',
    category: null,
  },
  {
    interestKey: 'interest_miscellaneous',
    label: 'Miscellaneous',
    question: 'Would you like to request any additional items for your stay?',
    description: 'Baby equipment and other villa-specific extras available upon request.',
    category: 'Miscellaneous',
  },
]

const TOTAL_STEPS = 1 + SERVICE_STEPS.length + 1 // arrival + 6 services + notes/submit

export default function OnboardWizard({ token, booking, liabilityContent, activities }: Props) {
  const [step, setStep] = useState(0)
  const [isPending, startTransition] = useTransition()

  // Step 0 fields
  const [numGuests, setNumGuests] = useState('')
  const [numGuestsUnder6, setNumGuestsUnder6] = useState('')
  const [arrivalFlight, setArrivalFlight] = useState('')
  const [arrivalDatetime, setArrivalDatetime] = useState('')
  const [departureFlight, setDepartureFlight] = useState('')
  const [departureDatetime, setDepartureDatetime] = useState('')
  const [liabilityData, setLiabilityData] = useState({
    agreed: false, name: '', date: '', signature: '',
  })
  const handleLiabilityChange = useCallback((data: typeof liabilityData) => {
    setLiabilityData(data)
  }, [])

  // Service interest answers: null = not answered, true = yes, false = no
  const [interests, setInterests] = useState<Record<string, boolean | null>>(
    Object.fromEntries(SERVICE_STEPS.map((s) => [s.interestKey, null]))
  )

  // Activity selections per ID
  const [activityState, setActivityState] = useState<
    Record<string, { selected: boolean; notes: string }>
  >({})

  // Transport car insurance
  const [carInsurance, setCarInsurance] = useState<boolean | null>(null)

  // Provisioning checklist
  const [groceryItems, setGroceryItems] = useState<Record<string, boolean>>({})
  const [groceryNotes, setGroceryNotes] = useState('')
  function toggleGrocery(key: string) {
    setGroceryItems(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Wine selection notes
  const [wineNotes, setWineNotes] = useState('')

  // Chef special event
  const [chefSpecialEvent, setChefSpecialEvent] = useState(false)
  const [chefSpecialEventDesc, setChefSpecialEventDesc] = useState('')

  // Final step
  const [guestNotes, setGuestNotes] = useState('')

  const client = booking.clients
  const villa = booking.villas

  // Group activities by category
  const byCategory = activities.reduce<Record<string, Activity[]>>((acc, a) => {
    const cat = a.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(a)
    return acc
  }, {})

  const currentService =
    step >= 1 && step <= SERVICE_STEPS.length ? SERVICE_STEPS[step - 1] : null
  const currentInterest = currentService ? interests[currentService.interestKey] : null
  const currentActivities = currentService?.category
    ? (byCategory[currentService.category] ?? [])
    : []

  function next() {
    setStep((s) => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function back() {
    setStep((s) => s - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function setInterest(key: string, value: boolean) {
    setInterests((prev) => ({ ...prev, [key]: value }))
  }

  function toggleActivity(id: string) {
    setActivityState((prev) => ({
      ...prev,
      [id]: { selected: !prev[id]?.selected, notes: prev[id]?.notes ?? '' },
    }))
  }

  function setActivityNotes(id: string, notes: string) {
    setActivityState((prev) => ({
      ...prev,
      [id]: { ...prev[id], notes },
    }))
  }

  function handleSubmit() {
    startTransition(async () => {
      const fd = new FormData()
      if (numGuests) fd.append('num_guests', numGuests)
      if (numGuestsUnder6) fd.append('num_guests_under_6', numGuestsUnder6)
      fd.append('arrival_flight', arrivalFlight)
      if (arrivalDatetime) fd.append('arrival_datetime', arrivalDatetime)
      fd.append('departure_flight', departureFlight)
      if (departureDatetime) fd.append('departure_datetime', departureDatetime)
      if (liabilityData.agreed) fd.append('agreed_to_liability', 'on')
      if (liabilityData.name) fd.append('liability_signed_name', liabilityData.name)
      if (liabilityData.date) fd.append('liability_signed_date', liabilityData.date)
      if (liabilityData.signature) fd.append('liability_signature', liabilityData.signature)

      for (const [key, value] of Object.entries(interests)) {
        if (value) fd.append(key, 'on')
      }

      for (const [id, state] of Object.entries(activityState)) {
        if (state.selected) {
          fd.append('activity_ids', id)
          const act = activities.find((a) => a.id === id)
          fd.append(`activity_name_${id}`, act?.name ?? '')
          if (act?.price != null) fd.append(`activity_price_${id}`, String(act.price))
          if (act?.duration) fd.append(`activity_duration_${id}`, act.duration)
          if (state.notes) fd.append(`activity_notes_${id}`, state.notes)
        }
      }

      if (carInsurance !== null) fd.append('car_insurance', carInsurance ? 'yes' : 'no')
      const selectedGroceries = Object.entries(groceryItems).filter(([,v]) => v).map(([k]) => k)
      if (selectedGroceries.length) fd.append('grocery_items', selectedGroceries.join(', '))
      if (groceryNotes) fd.append('grocery_notes', groceryNotes)
      if (wineNotes) fd.append('wine_notes', wineNotes)
      if (chefSpecialEvent) {
        fd.append('chef_special_event', 'on')
        if (chefSpecialEventDesc) fd.append('chef_special_event_desc', chefSpecialEventDesc)
      }
      fd.append('guest_notes', guestNotes)
      await submitOnboarding(token, fd)
    })
  }

  const progress = Math.round((step / (TOTAL_STEPS - 1)) * 100)

  return (
    <div className="space-y-5">
      {/* Booking header */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-[#1f5772]">
          Welcome to
        </p>
        <h1 className="text-xl font-semibold text-gray-900">{villa?.name}</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          {client ? `Hi ${client.name.split(' ')[0]}, we` : 'We'}&apos;re excited to welcome you.
        </p>
        {(booking.check_in || booking.check_out) && (
          <div className="mt-2 flex flex-wrap gap-5 text-xs text-gray-500">
            {booking.check_in && (
              <span>
                Check-in:{' '}
                <span className="font-medium text-gray-700">
                  {new Date(booking.check_in).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </span>
            )}
            {booking.check_out && (
              <span>
                Check-out:{' '}
                <span className="font-medium text-gray-700">
                  {new Date(booking.check_out).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Step {step + 1} of {TOTAL_STEPS}</span>
          <span>{progress}% complete</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-1.5 rounded-full bg-[#1f5772] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ── Step 0: Arrival details + Liability ── */}
      {step === 0 && (
        <div className="space-y-5">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-base font-semibold text-gray-900">Arrival Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Number of guests
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={numGuests}
                  onChange={(e) => setNumGuests(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]"
                  placeholder="e.g. 4"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Guests under age 6
                  <span className="ml-1 font-normal text-gray-400">(for tax purposes)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={numGuestsUnder6}
                  onChange={(e) => setNumGuestsUnder6(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]"
                  placeholder="e.g. 0"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Arrival flight
                </label>
                <input
                  value={arrivalFlight}
                  onChange={(e) => setArrivalFlight(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]"
                  placeholder="e.g. AA 1234"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Arrival date &amp; time
                </label>
                <input
                  type="datetime-local"
                  value={arrivalDatetime}
                  onChange={(e) => setArrivalDatetime(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Departure flight
                </label>
                <input
                  value={departureFlight}
                  onChange={(e) => setDepartureFlight(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]"
                  placeholder="e.g. AA 5678"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Departure date &amp; time
                </label>
                <input
                  type="datetime-local"
                  value={departureDatetime}
                  onChange={(e) => setDepartureDatetime(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]"
                />
              </div>
            </div>
          </div>

          <LiabilityWaiver
            content={liabilityContent}
            villaName={villa?.name ?? 'this property'}
            onChange={handleLiabilityChange}
          />

          <button
            type="button"
            onClick={next}
            disabled={!liabilityData.agreed}
            className="w-full rounded-lg bg-[#1f5772] px-6 py-3 text-sm font-semibold text-white hover:bg-[#174560] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* ── Steps 1-6: Service interest ── */}
      {currentService && (
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[#1f5772]">
              {currentService.label}
            </p>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">
              {currentService.question}
            </h2>
            <p className="mb-6 text-sm text-gray-500">{currentService.description}</p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setInterest(currentService.interestKey, true)}
                className={`flex-1 rounded-lg border-2 py-3 text-sm font-semibold transition-colors ${
                  currentInterest === true
                    ? 'border-[#1f5772] bg-[#1f5772] text-white'
                    : 'border-gray-200 text-gray-700 hover:border-[#1f5772]/50'
                }`}
              >
                Yes, I&apos;m interested
              </button>
              <button
                type="button"
                onClick={() => setInterest(currentService.interestKey, false)}
                className={`flex-1 rounded-lg border-2 py-3 text-sm font-semibold transition-colors ${
                  currentInterest === false
                    ? 'border-gray-400 bg-gray-100 text-gray-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-400'
                }`}
              >
                No, thanks
              </button>
            </div>
          </div>

          {/* Activity list — only shown if Yes and activities exist */}
          {currentInterest === true && currentActivities.length > 0 && (
            <div className="rounded-lg border border-[#1f5772]/20 bg-white p-6">
              <h3 className="mb-4 text-sm font-semibold text-gray-700">
                Select any you&apos;d like to book:
              </h3>
              <div className="space-y-3">
                {currentActivities.map((activity) => {
                  const state = activityState[activity.id]
                  return (
                    <div
                      key={activity.id}
                      className={`rounded-lg border p-3 transition-colors ${
                        state?.selected
                          ? 'border-[#1f5772]/30 bg-[#1f5772]/5'
                          : 'border-gray-200'
                      }`}
                    >
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={state?.selected ?? false}
                          onChange={() => toggleActivity(activity.id)}
                          className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#1f5772]"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {activity.name}
                            </span>
                            {activity.price != null && (
                              <span className="text-xs text-gray-500">${activity.price}</span>
                            )}
                            {activity.duration && (
                              <span className="text-xs text-gray-400">· {activity.duration}</span>
                            )}
                          </div>
                          {activity.description && (
                            <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                              {activity.description}
                            </p>
                          )}
                        </div>
                      </label>
                      {state?.selected && (
                        <div className="mt-2 pl-7">
                          <input
                            type="text"
                            value={state.notes}
                            onChange={(e) => setActivityNotes(activity.id, e.target.value)}
                            placeholder="Please specify your preferred dates and times"
                            className="w-full rounded border border-gray-200 px-2.5 py-1.5 text-xs outline-none focus:border-[#1f5772] placeholder:text-gray-400"
                          />
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Chef: Special Event option */}
                {currentService.interestKey === 'interest_chef' && (
                  <div className={`rounded-lg border p-3 transition-colors ${
                    chefSpecialEvent ? 'border-[#1f5772]/30 bg-[#1f5772]/5' : 'border-gray-200'
                  }`}>
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={chefSpecialEvent}
                        onChange={() => setChefSpecialEvent(v => !v)}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#1f5772]"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-gray-900">Special Event</span>
                        <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                          Planning a celebration, private dinner, or other special occasion? Let us know and we&apos;ll provide a custom quote.
                        </p>
                      </div>
                    </label>
                    {chefSpecialEvent && (
                      <div className="mt-2 pl-7">
                        <textarea
                          value={chefSpecialEventDesc}
                          onChange={(e) => setChefSpecialEventDesc(e.target.value)}
                          rows={3}
                          placeholder="Please describe your event — occasion, number of guests, preferred date, cuisine preferences, etc."
                          className="w-full rounded border border-gray-200 px-2.5 py-1.5 text-xs outline-none focus:border-[#1f5772] placeholder:text-gray-400"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chef: Special Event when no other activities configured */}
          {currentInterest === true && currentActivities.length === 0 && currentService.interestKey === 'interest_chef' && (
            <div className="rounded-lg border border-[#1f5772]/20 bg-white p-6">
              <h3 className="mb-4 text-sm font-semibold text-gray-700">Select any you&apos;d like to book:</h3>
              <div className={`rounded-lg border p-3 transition-colors ${
                chefSpecialEvent ? 'border-[#1f5772]/30 bg-[#1f5772]/5' : 'border-gray-200'
              }`}>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={chefSpecialEvent}
                    onChange={() => setChefSpecialEvent(v => !v)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#1f5772]"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-gray-900">Special Event</span>
                    <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                      Planning a celebration, private dinner, or other special occasion? Let us know and we&apos;ll provide a custom quote.
                    </p>
                  </div>
                </label>
                {chefSpecialEvent && (
                  <div className="mt-2 pl-7">
                    <textarea
                      value={chefSpecialEventDesc}
                      onChange={(e) => setChefSpecialEventDesc(e.target.value)}
                      rows={3}
                      placeholder="Please describe your event — occasion, number of guests, preferred date, cuisine preferences, etc."
                      className="w-full rounded border border-gray-200 px-2.5 py-1.5 text-xs outline-none focus:border-[#1f5772] placeholder:text-gray-400"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Transport: car insurance */}
          {currentInterest === true && currentService.interestKey === 'interest_transport' && (
            <div className="rounded-lg border border-[#1f5772]/20 bg-white p-6">
              <p className="mb-3 text-sm font-semibold text-gray-700">Optional Car Insurance</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCarInsurance(true)}
                  className={`flex-1 rounded-lg border-2 py-3 text-sm font-semibold transition-colors ${
                    carInsurance === true
                      ? 'border-[#1f5772] bg-[#1f5772] text-white'
                      : 'border-gray-200 text-gray-700 hover:border-[#1f5772]/50'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setCarInsurance(false)}
                  className={`flex-1 rounded-lg border-2 py-3 text-sm font-semibold transition-colors ${
                    carInsurance === false
                      ? 'border-gray-400 bg-gray-100 text-gray-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  No
                </button>
              </div>
              {carInsurance === true && (
                <p className="mt-3 rounded bg-[#1f5772]/5 px-4 py-2.5 text-xs text-[#1f5772]">
                  Great — we will get you a quote for car insurance and include it with your transport details.
                </p>
              )}
            </div>
          )}

          {/* Wine: selection textarea */}
          {currentInterest === true && currentService.interestKey === 'interest_wine' && (
            <div className="rounded-lg border border-[#1f5772]/20 bg-white p-6">
              <p className="mb-3 text-sm text-[#1f5772]">
                Please review the wine list from your welcome package and let us know your preferred selection and quantity below.
              </p>
              <textarea
                value={wineNotes}
                onChange={(e) => setWineNotes(e.target.value)}
                rows={4}
                placeholder="Please indicate exactly which bottle of wine you would like to order, along with any codes and the quantity of each."
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772] placeholder:text-gray-400"
              />
            </div>
          )}

          {/* Provisioning: grocery checklist */}
          {currentInterest === true && currentService.interestKey === 'interest_provisioning' && (
            <div className="rounded-lg border border-[#1f5772]/20 bg-white p-6 space-y-6">
              {[
                {
                  emoji: '🥐', label: 'Breakfast Essentials', items: [
                    'Eggs (½ dozen / 1 dozen)', 'Milk (Whole / Skim / Almond / Oat)',
                    'Bread (White / Whole Wheat / Gluten-Free)', 'Butter / Margarine',
                    'Cheese (Cheddar / Mozzarella / Other)', 'Bacon / Sausage',
                    'Yogurt (Plain / Flavored)', 'Fresh Fruit (Bananas / Apples / Oranges / Mixed)',
                    'Cereal / Granola', 'Coffee (Ground / Pods)', 'Tea',
                  ],
                },
                {
                  emoji: '🥗', label: 'Lunch & Dinner Basics', items: [
                    'Chicken (Breasts / Thighs / Whole)', 'Fish / Shrimp',
                    'Ground Beef / Steak / Pork', 'Rice', 'Pasta + Sauce', 'Potatoes',
                    'Salad Greens', 'Vegetables (Carrots / Broccoli / Peppers / Mixed)',
                    'Olive Oil / Cooking Oil', 'Salt / Pepper / Seasonings',
                  ],
                },
                {
                  emoji: '🥤', label: 'Drinks & Beverages', items: [
                    'Water (Still / Sparkling)', 'Juice (Orange / Apple / Other)',
                    'Sodas / Soft Drinks', 'Beer', 'Rum / Spirits',
                    'Ice',
                  ],
                },
                {
                  emoji: '🍿', label: 'Snacks & Extras', items: [
                    'Chips / Crackers', 'Nuts / Dried Fruit', 'Chocolate / Candy',
                    'Jam / Honey / Peanut Butter', 'Condiments (Ketchup / Mayo / Mustard)',
                    'Sunscreen', 'Insect Repellent',
                  ],
                },
              ].map(({ emoji, label, items }) => (
                <div key={label}>
                  <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <span>{emoji}</span> {label}
                  </p>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <label key={item} className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={groceryItems[item] ?? false}
                          onChange={() => toggleGrocery(item)}
                          className="h-4 w-4 rounded border-gray-300 accent-[#1f5772]"
                        />
                        <span className="text-sm text-gray-700">{item}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-4 border-t border-gray-100" />
                </div>
              ))}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Special Requests / Additional Items
                </label>
                <textarea
                  value={groceryNotes}
                  onChange={(e) => setGroceryNotes(e.target.value)}
                  rows={3}
                  placeholder="Any dietary requirements, specific brands, baby food, or other items not listed above…"
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772] placeholder:text-gray-400"
                />
              </div>
            </div>
          )}

          {/* Fallback for other categories with no activities */}
          {currentInterest === true && currentActivities.length === 0
            && currentService.interestKey !== 'interest_wine'
            && currentService.interestKey !== 'interest_chef'
            && currentService.interestKey !== 'interest_provisioning' && (
            <div className="rounded-lg border border-[#1f5772]/20 bg-[#1f5772]/5 p-4 text-sm text-[#1f5772]">
              Your property manager will follow up with {currentService.label.toLowerCase()} details and availability.
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={back}
              className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={next}
              disabled={currentInterest === null}
              className="flex-1 rounded-lg bg-[#1f5772] px-6 py-3 text-sm font-semibold text-white hover:bg-[#174560] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ── Final step: Notes + Submit ── */}
      {step === TOTAL_STEPS - 1 && (
        <div className="space-y-5">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-1 text-base font-semibold text-gray-900">Almost done!</h2>
            <p className="mb-4 text-sm text-gray-500">
              Is there anything else we should know? Dietary requirements, celebrations,
              accessibility needs, or special requests.
            </p>
            <textarea
              value={guestNotes}
              onChange={(e) => setGuestNotes(e.target.value)}
              rows={4}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]"
              placeholder="Let us know anything that will help us prepare for your arrival…"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={back}
              className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="flex-1 rounded-lg bg-[#1f5772] px-6 py-3 text-sm font-semibold text-white hover:bg-[#174560] disabled:opacity-50"
            >
              {isPending ? 'Submitting…' : 'Submit Pre-Arrival Information'}
            </button>
          </div>

          <p className="text-center text-xs text-gray-400">
            Having trouble? Contact Jamie at{' '}
            <a href="mailto:mgl365management@gmail.com" className="underline">
              mgl365management@gmail.com
            </a>{' '}
            or{' '}
            <a href="tel:+12687885675" className="underline">
              +1-268-788-5675
            </a>
          </p>
        </div>
      )}
    </div>
  )
}
