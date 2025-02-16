import {
  Moon,
  Sun,
  Laptop,
  Settings,
  Link,
  Edit,
  Trash,
  RefreshCw,
  Loader2,
  LucideProps,
  LucideIcon,
  Palette,
  Menu,
} from "lucide-react"

export type Icon = LucideIcon

export const Icons = {
  sun: Sun,
  moon: Moon,
  laptop: Laptop,
  settings: Settings,
  link: Link,
  edit: Edit,
  trash: Trash,
  refresh: RefreshCw,
  spinner: Loader2,
  palette: Palette,
  google: ({ ...props }: LucideProps) => (
    <svg role="img" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
      />
    </svg>
  ),
  notion: ({ ...props }: LucideProps) => (
    <svg role="img" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.62c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"
      />
    </svg>
  ),
  logo: ({ ...props }: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      {...props}
    >
      <rect x="10" y="10" width="20" height="20" rx="4" fill="currentColor" className="opacity-40" />
      <rect x="35" y="10" width="20" height="20" rx="4" fill="currentColor" className="opacity-60" />
      <rect x="60" y="10" width="20" height="20" rx="4" fill="currentColor" className="opacity-40" />
      <rect x="35" y="35" width="20" height="20" rx="4" fill="currentColor" className="opacity-80" />
      <rect x="60" y="35" width="20" height="20" rx="4" fill="currentColor" />
      <rect x="10" y="60" width="20" height="20" rx="4" fill="currentColor" />
      <rect x="35" y="60" width="20" height="20" rx="4" fill="currentColor" className="opacity-40" />
      <rect x="60" y="60" width="20" height="20" rx="4" fill="currentColor" className="opacity-60" />
    </svg>
  ),
  menu: Menu,
} as const 