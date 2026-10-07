import Icon, { ICON_NAMES } from '../components/Icon'
import Goat from '../components/Goat'
export default function IconSheet() {
  return (
    <div className="p-6 bg-cream">
      <div className="flex gap-6 items-end mb-6">
        <Goat className="h-40 w-40" /><Goat className="h-24 w-24" mood="talk" />
      </div>
      <div className="grid grid-cols-8 gap-4">
        {ICON_NAMES.map((n) => (
          <div key={n} className="flex flex-col items-center gap-1 text-xs">
            <span className="rounded-xl bg-white p-3 text-red ring-1 ring-red/20"><Icon name={n} className="h-10 w-10" /></span>
            <span className="rounded-xl bg-red-dark p-3 text-white"><Icon name={n} className="h-8 w-8" /></span>
            {n}
          </div>
        ))}
      </div>
    </div>
  )
}
