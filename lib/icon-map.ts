import {
  Activity, Anvil, Award, Baby, BadgeCheck, Bath, Bell, Bike, Book, BookOpen,
  Briefcase, Brush, Building2, Bus, Calendar, CalendarCheck, Camera, Car, CarFront,
  Check, CheckCircle2, ChefHat, ClipboardCheck, Clock, Coffee, Compass, CreditCard,
  Croissant, Crown, Dog, Droplet, Dumbbell, Eye, Facebook, FileText, Flame, Flower,
  Gauge, Gem, Gift, GraduationCap, Hammer, Handshake, HardHat, Headphones, Heart,
  HeartPulse, HelpCircle, Home, House, Image, Instagram, Key, Landmark, Laptop, Leaf,
  Lightbulb, Linkedin, Lock, Mail, MapPin, MapPinned, Megaphone, MessageCircle, Mic,
  Monitor, Moon, MoonStar, Music, Navigation, Package, PaintRoller, Palette, PawPrint, PenTool,
  Phone, PiggyBank, Plane, PlugZap, Power, Printer, Quote, Recycle, Ruler, Scale,
  Scissors, Send, Settings, ShieldCheck, ShoppingBag, Shovel, Siren, Smile, Snowflake,
  Sofa, Sparkles, Sprout, Star, Stethoscope, Store, Sun, SunMedium, Syringe, Target, ThumbsUp,
  Timer, Trees, TrendingUp, Trophy, Truck, User, Users, Utensils, Video, Wallet, Wand2,
  Watch, Waves, Wind, Wrench, Youtube, Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * Curated icon set — the icons a config may name.
 *
 * WHY A MAP INSTEAD OF `import { icons } from "lucide-react"`: that barrel pulls
 * lucide's ENTIRE export map (1,544 icons) into the bundle, because a dynamic
 * `icons[key]` lookup can't be tree-shaken. Measured on a production build it
 * cost a 436 KB chunk — shipped to every visitor on a brochure site, for ~12
 * icons actually used.
 *
 * These are named imports, so the bundler keeps only what's referenced here.
 * Adding an icon = add the import + an entry below.
 *
 * Keys are the normalised (lowercase, separator-free) form of the name a config
 * writes, so `"shield-check"`, `"shieldCheck"` and `"ShieldCheck"` all resolve.
 */
const ICONS = {
  activity: Activity, anvil: Anvil, award: Award, baby: Baby, badgecheck: BadgeCheck,
  bath: Bath, bell: Bell, bike: Bike, book: Book, bookopen: BookOpen,
  briefcase: Briefcase, brush: Brush, building: Building2, building2: Building2,
  bus: Bus, calendar: Calendar, calendarcheck: CalendarCheck, camera: Camera,
  car: Car, carfront: CarFront, check: Check, checkcircle: CheckCircle2,
  chefhat: ChefHat, clipboardcheck: ClipboardCheck, clock: Clock, coffee: Coffee,
  compass: Compass, creditcard: CreditCard, croissant: Croissant, crown: Crown,
  dog: Dog, droplet: Droplet, dumbbell: Dumbbell, eye: Eye, facebook: Facebook,
  filetext: FileText, flame: Flame, flower: Flower, gauge: Gauge, gem: Gem,
  gift: Gift, graduationcap: GraduationCap, hammer: Hammer, handshake: Handshake,
  hardhat: HardHat, headphones: Headphones, heart: Heart, heartpulse: HeartPulse,
  helpcircle: HelpCircle, home: Home, house: House, image: Image,
  instagram: Instagram, key: Key, landmark: Landmark, laptop: Laptop, leaf: Leaf,
  lightbulb: Lightbulb, linkedin: Linkedin, lock: Lock, mail: Mail, mappin: MapPin,
  mappinned: MapPinned, megaphone: Megaphone, messagecircle: MessageCircle, mic: Mic,
  monitor: Monitor, moon: Moon, moonstar: MoonStar, music: Music, navigation: Navigation,
  package: Package, paintroller: PaintRoller, palette: Palette, pawprint: PawPrint,
  pentool: PenTool, phone: Phone, piggybank: PiggyBank, plane: Plane,
  plugzap: PlugZap, power: Power, printer: Printer, quote: Quote, recycle: Recycle,
  ruler: Ruler, scale: Scale, scissors: Scissors, send: Send, settings: Settings,
  shieldcheck: ShieldCheck, shoppingbag: ShoppingBag, shovel: Shovel, siren: Siren,
  smile: Smile, snowflake: Snowflake, sofa: Sofa, sparkles: Sparkles, sprout: Sprout,
  star: Star, stethoscope: Stethoscope, store: Store, sun: Sun, sunmedium: SunMedium, syringe: Syringe,
  target: Target, thumbsup: ThumbsUp, timer: Timer, trees: Trees,
  trendingup: TrendingUp, trophy: Trophy, truck: Truck, user: User, users: Users,
  utensils: Utensils, video: Video, wallet: Wallet, wand: Wand2, watch: Watch,
  waves: Waves, wind: Wind, wrench: Wrench, youtube: Youtube, zap: Zap,
} satisfies Record<string, LucideIcon>;

/** Normalise a config-supplied name: "shield-check" / "ShieldCheck" → "shieldcheck". */
export function normalizeIconName(name: string): string {
  return name.toLowerCase().replace(/[-_\s]+/g, "");
}

/** Look up a curated icon, or `undefined` if the name isn't in the set. */
export function lookupIcon(name: string): LucideIcon | undefined {
  return (ICONS as Record<string, LucideIcon>)[normalizeIconName(name)];
}

/** Every supported name (for docs, tests, and the fallback warning). */
export const ICON_NAMES = Object.keys(ICONS);

export { HelpCircle as FallbackIcon };
