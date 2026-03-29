import { useEffect, useRef, useState } from 'react';
import { Package, Plane, Leaf, Users } from 'lucide-react';
import { useInView } from '../../hooks/useInView';

const STATS = [
  {
    icon: Package,
    raw: 2847,
    display: '2 847',
    label: 'Colis livrés',
    sublabel: 'depuis le lancement',
    color: 'ocean',
    suffix: '',
  },
  {
    icon: Leaf,
    raw: 42,
    display: '4,2',
    label: 'CO₂ économisé',
    sublabel: 'équivalent 23 vols Paris-Réunion',
    color: 'eco',
    suffix: ' t',
  },
  {
    icon: Plane,
    raw: 1230,
    display: '1 230',
    label: 'Voyageurs inscrits',
    sublabel: 'sur les 3 destinations',
    color: 'ocean',
    suffix: '',
  },
  {
    icon: Users,
    raw: 98,
    display: '98',
    label: 'Satisfaction',
    sublabel: 'avis vérifiés',
    color: 'eco',
    suffix: '%',
  },
];

function AnimatedNumber({ raw, display, suffix, active, color }: {
  raw: number;
  display: string;
  suffix: string;
  active: boolean;
  color: string;
}) {
  const [shown, setShown] = useState('0');
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    const duration = 1400;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * raw);
      if (raw >= 1000) {
        setShown(current.toLocaleString('fr-FR').replace(/\u202f/g, '\u00a0'));
      } else {
        setShown(String(current));
      }
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setShown(display);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [active]);

  return (
    <span className={`text-3xl font-poppins font-bold tabular-nums ${color === 'ocean' ? 'text-ocean-700' : 'text-eco-700'}`}>
      {shown}{suffix}
    </span>
  );
}

export function Stats() {
  const { ref, inView } = useInView({ threshold: 0.2 });

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="py-16 bg-gradient-to-br from-ocean-50 to-eco-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-10 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            DONNALI en chiffres
          </h2>
          <p className="text-gray-500">Notre impact sur les échanges entre îles et métropole</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, index) => {
            const Icon = stat.icon;
            const isOcean = stat.color === 'ocean';
            return (
              <div
                key={index}
                style={{ transitionDelay: `${index * 100}ms` }}
                className={`bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover border border-gray-50 text-center group
                  transition-all duration-700
                  ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              >
                <div
                  className={`w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
                    isOcean ? 'bg-ocean-100' : 'bg-eco-100'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isOcean ? 'text-ocean-600' : 'text-eco-600'}`} />
                </div>
                <div className="mb-1">
                  <AnimatedNumber
                    raw={stat.raw}
                    display={stat.display}
                    suffix={stat.suffix}
                    active={inView}
                    color={stat.color}
                  />
                </div>
                <div className="font-semibold text-gray-800 text-sm mb-1">{stat.label}</div>
                <div className="text-gray-400 text-xs">{stat.sublabel}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
