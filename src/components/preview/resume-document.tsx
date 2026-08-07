'use client'

import * as React from 'react'
import type {
  Certification,
  CustomSection,
  Education,
  Experience,
  Language,
  Project,
  Resume,
  ResumeStyle,
  SectionId,
  Skill,
} from '@/types'
import { ACCENT_COLOR_HEX } from '@/constants'
import { getVisibleSections } from '@/utils/resume'
import { formatDateRange } from '@/utils/date'

/**
 * ───────────────────────────────────────────────
 * ResumeDocument
 * ───────────────────────────────────────────────
 * Renders the resume "paper" content from the editor
 * store. Six template layouts (modern, classic,
 * creative, professional, executive, safety) driven by
 * `resume.style` — accent color, font family, font
 * size, line height and page margins.
 *
 * The root element gets explicit A4 dimensions from
 * the preview wrapper; everything inside is in px.
 * ───────────────────────────────────────────────
 */

/** Convert mm → px at 96 DPI. */
const mmToPx = (mm: number): number => Math.round(mm * 3.7795)

const FONT_STACKS: Record<ResumeStyle['fontFamily'], string> = {
  sans: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
  serif: "Georgia, 'Times New Roman', Cambria, serif",
  mono: "ui-monospace, 'JetBrains Mono', 'Courier New', monospace",
}

const BASE_SIZES = { sm: 12, md: 13.5, lg: 15 } as const
const HEADING_SIZES = { sm: 11.5, md: 12.5, lg: 13.5 } as const
const LINE_HEIGHTS = { tight: 1.3, normal: 1.55, relaxed: 1.75 } as const

const SKILL_LEVEL_ORDER = [
  'beginner',
  'intermediate',
  'advanced',
  'expert',
] as const

export function ResumeDocument({ resume }: { resume: Resume }) {
  const { style } = resume
  const accent = ACCENT_COLOR_HEX[style.accentColor]
  const baseSize = BASE_SIZES[style.fontSize]
  const headingSize = HEADING_SIZES[style.fontSize]
  const lineHeight = LINE_HEIGHTS[style.lineHeight]
  const fontFamily = FONT_STACKS[style.fontFamily]

  const padding = {
    top: mmToPx(style.margins.top),
    right: mmToPx(style.margins.right),
    bottom: mmToPx(style.margins.bottom),
    left: mmToPx(style.margins.left),
  }

  const visible = getVisibleSections(resume.sections).map((s) => s.id)
  const hasContent =
    resume.personalInfo.fullName ||
    resume.summary ||
    resume.experiences.length > 0 ||
    resume.educations.length > 0 ||
    resume.skills.length > 0 ||
    resume.certifications.length > 0 ||
    resume.languages.length > 0 ||
    resume.projects.length > 0 ||
    resume.customSections.length > 0

  const common: CommonProps = {
    resume,
    accent,
    baseSize,
    headingSize,
    lineHeight,
    fontFamily,
    visible,
  }

  if (!hasContent) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          fontFamily,
          padding: padding.top,
        }}
        className="flex flex-col items-center justify-center text-center"
      >
        <p
          style={{
            fontSize: baseSize * 1.4,
            fontWeight: 600,
            color: '#334155',
          }}
        >
          Your resume appears here
        </p>
        <p
          style={{
            marginTop: 8,
            fontSize: baseSize,
            color: '#94a3b8',
            maxWidth: 320,
          }}
        >
          Fill in the form on the left — the preview updates live as you type.
        </p>
      </div>
    )
  }

  switch (style.template) {
    case 'modern':
      return <ModernLayout {...common} padding={padding} />
    case 'classic':
      return <ClassicLayout {...common} padding={padding} />
    case 'professional':
      return <ProfessionalLayout {...common} padding={padding} />
    case 'executive':
      return <ExecutiveLayout {...common} padding={padding} />
    case 'creative':
      return <CreativeLayout {...common} padding={padding} />
    case 'safety':
      return <SafetyLayout {...common} padding={padding} />
    default:
      return <ModernLayout {...common} padding={padding} />
  }
}

/* ───────────────────────────────────────────
 * Shared building blocks
 * ─────────────────────────────────────────── */

interface CommonProps {
  resume: Resume
  accent: string
  baseSize: number
  headingSize: number
  lineHeight: number
  fontFamily: string
  visible: SectionId[]
}

type Padding = { top: number; right: number; bottom: number; left: number }

function SectionHeading({
  title,
  accent,
  headingSize,
  color = '#0f172a',
  variant = 'rule',
}: {
  title: string
  accent: string
  headingSize: number
  color?: string
  variant?: 'rule' | 'bar' | 'thin' | 'heavy'
}) {
  return (
    <div style={{ marginBottom: 10, marginTop: 18 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {variant === 'bar' ? (
          <span
            style={{
              width: 4,
              height: headingSize + 3,
              background: accent,
              borderRadius: 2,
            }}
          />
        ) : null}
        <h3
          style={{
            margin: 0,
            fontSize: headingSize,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color,
            fontFamily: 'inherit',
          }}
        >
          {title}
        </h3>
      </div>
      {variant === 'rule' ? (
        <div
          style={{
            marginTop: 6,
            height: 2,
            background: accent,
            width: 42,
            borderRadius: 1,
          }}
        />
      ) : null}
      {variant === 'thin' ? (
        <div style={{ marginTop: 6, height: 1, background: '#cbd5e1' }} />
      ) : null}
      {variant === 'heavy' ? (
        <div style={{ marginTop: 6, height: 3, background: accent }} />
      ) : null}
    </div>
  )
}

function ContactLine({
  items,
  color,
  size,
  separator = ' · ',
}: {
  items: string[]
  color: string
  size: number
  separator?: string
}) {
  const nonEmpty = items.filter(Boolean)
  if (nonEmpty.length === 0) return null
  return (
    <p style={{ margin: 0, fontSize: size, color, lineHeight: 1.5 }}>
      {nonEmpty.join(separator)}
    </p>
  )
}

function Bullets({
  items,
  color = '#334155',
  size,
  accent,
  lineHeight,
  marker = '•',
}: {
  items: string[]
  color?: string
  size: number
  accent: string
  lineHeight: number
  marker?: string
}) {
  const list = items.filter((item) => item.trim())
  if (list.length === 0) return null
  return (
    <ul style={{ margin: 0, paddingLeft: 16, listStyle: 'none' }}>
      {list.map((item, index) => (
        <li
          key={index}
          style={{
            position: 'relative',
            paddingLeft: 2,
            marginBottom: 3,
            fontSize: size,
            color,
            lineHeight,
          }}
        >
          <span
            style={{
              position: 'absolute',
              left: -13,
              top: 0,
              color: accent,
              fontWeight: 700,
            }}
          >
            {marker}
          </span>
          {item}
        </li>
      ))}
    </ul>
  )
}

function SkillDots({
  level,
  color,
  size = 5,
  active = true,
}: {
  level: Skill['level']
  color: string
  size?: number
  active?: boolean
}) {
  const levelIndex = SKILL_LEVEL_ORDER.indexOf(level)
  return (
    <span style={{ display: 'inline-flex', gap: 3, alignItems: 'center' }}>
      {SKILL_LEVEL_ORDER.map((_, index) => (
        <span
          key={index}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: index <= levelIndex ? color : 'transparent',
            border: `1px solid ${color}`,
            opacity: active ? 1 : index <= levelIndex ? 0.9 : 0.5,
          }}
        />
      ))}
    </span>
  )
}

function SkillsBlock({
  skills,
  accent,
  baseSize,
  lineHeight,
  dark = false,
}: {
  skills: Skill[]
  accent: string
  baseSize: number
  lineHeight: number
  dark?: boolean
}) {
  if (skills.length === 0) return null
  const label = dark ? 'rgba(255,255,255,0.85)' : '#334155'
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '6px 16px',
      }}
    >
      {skills.map((skill) => (
        <div
          key={skill.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: baseSize,
              color: label,
              lineHeight,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {skill.name}
          </span>
          <SkillDots level={skill.level} color={accent} />
        </div>
      ))}
    </div>
  )
}

function SidebarSkills({
  skills,
  accent,
  baseSize,
  lineHeight,
}: {
  skills: Skill[]
  accent: string
  baseSize: number
  lineHeight: number
}) {
  if (skills.length === 0) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {skills.map((skill) => {
        const levelIndex = SKILL_LEVEL_ORDER.indexOf(skill.level)
        return (
          <div key={skill.id}>
            <p
              style={{
                margin: 0,
                fontSize: baseSize,
                color: 'rgba(255,255,255,0.95)',
                lineHeight,
              }}
            >
              {skill.name}
            </p>
            <div style={{ marginTop: 3, display: 'flex', gap: 3 }}>
              {SKILL_LEVEL_ORDER.map((_, index) => (
                <span
                  key={index}
                  style={{
                    flex: 1,
                    height: 3,
                    borderRadius: 2,
                    background:
                      index <= levelIndex ? accent : 'rgba(255,255,255,0.25)',
                  }}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function LanguagesBlock({
  languages,
  color,
  baseSize,
  lineHeight,
  accent,
}: {
  languages: Language[]
  color: string
  baseSize: number
  lineHeight: number
  accent: string
}) {
  if (languages.length === 0) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {languages.map((lang) => (
        <div
          key={lang.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <span style={{ fontSize: baseSize, color, lineHeight }}>
            {lang.name}
          </span>
          <span
            style={{
              fontSize: baseSize - 2,
              color: accent,
              lineHeight,
              textTransform: 'capitalize',
            }}
          >
            {lang.proficiency}
          </span>
        </div>
      ))}
    </div>
  )
}

function ExperienceEntry({
  exp,
  baseSize,
  lineHeight,
  accent,
  headingSize,
  main = true,
}: {
  exp: Experience
  baseSize: number
  lineHeight: number
  accent: string
  headingSize: number
  main?: boolean
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: headingSize,
            fontWeight: 700,
            color: '#0f172a',
          }}
        >
          {exp.position || exp.company}
          {exp.company && exp.position ? (
            <span style={{ fontWeight: 500, color: '#475569' }}>
              {' '}
              · {exp.company}
            </span>
          ) : null}
        </p>
        <span
          style={{
            flexShrink: 0,
            fontSize: baseSize - 1.5,
            color: accent,
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          {formatDateRange(exp.startDate, exp.endDate, exp.current)}
        </span>
      </div>
      {(exp.location || exp.description.length > 0) && main ? (
        <p
          style={{
            margin: '2px 0 4px',
            fontSize: baseSize - 1.5,
            color: '#64748b',
          }}
        >
          {exp.location}
        </p>
      ) : null}
      <Bullets
        items={exp.description}
        size={baseSize - 0.5}
        accent={accent}
        lineHeight={lineHeight}
      />
    </div>
  )
}

function EducationEntry({
  edu,
  baseSize,
  lineHeight,
  accent,
  headingSize,
}: {
  edu: Education
  baseSize: number
  lineHeight: number
  accent: string
  headingSize: number
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: headingSize,
            fontWeight: 700,
            color: '#0f172a',
          }}
        >
          {edu.degree}
          {edu.field ? (
            <span style={{ fontWeight: 500, color: '#475569' }}>
              {' '}
              · {edu.field}
            </span>
          ) : null}
        </p>
        <span
          style={{
            flexShrink: 0,
            fontSize: baseSize - 1.5,
            color: accent,
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          {formatDateRange(edu.startDate, edu.endDate, edu.current)}
        </span>
      </div>
      <p
        style={{
          margin: '2px 0 0',
          fontSize: baseSize - 1.5,
          color: '#64748b',
        }}
      >
        {[edu.institution, edu.location, edu.grade].filter(Boolean).join(' — ')}
      </p>
      {edu.description ? (
        <p
          style={{
            margin: '4px 0 0',
            fontSize: baseSize - 0.5,
            color: '#475569',
            lineHeight,
          }}
        >
          {edu.description}
        </p>
      ) : null}
    </div>
  )
}

function CertificationEntry({
  cert,
  baseSize,
  accent,
}: {
  cert: Certification
  baseSize: number
  accent: string
}) {
  return (
    <div style={{ marginBottom: 8 }}>
      <p
        style={{
          margin: 0,
          fontSize: baseSize,
          fontWeight: 600,
          color: '#0f172a',
        }}
      >
        {cert.name}
      </p>
      <p style={{ margin: 0, fontSize: baseSize - 1.5, color: '#64748b' }}>
        {[cert.issuer, formatDateRange(cert.issueDate, cert.expiryDate)]
          .filter(Boolean)
          .join(' · ')}
        {cert.credentialId ? ` · ID: ${cert.credentialId}` : ''}
      </p>
      {cert.credentialUrl ? (
        <p style={{ margin: 0, fontSize: baseSize - 2, color: accent }}>
          {cert.credentialUrl}
        </p>
      ) : null}
    </div>
  )
}

function ProjectEntry({
  project,
  baseSize,
  lineHeight,
  accent,
}: {
  project: Project
  baseSize: number
  lineHeight: number
  accent: string
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: baseSize + 0.5,
            fontWeight: 700,
            color: '#0f172a',
          }}
        >
          {project.name}
          {project.url ? (
            <span
              style={{
                fontWeight: 500,
                color: accent,
                fontSize: baseSize - 1.5,
              }}
            >
              {' '}
              · {project.url.replace(/^https?:\/\//, '')}
            </span>
          ) : null}
        </p>
        <span
          style={{
            flexShrink: 0,
            fontSize: baseSize - 1.5,
            color: '#64748b',
            whiteSpace: 'nowrap',
          }}
        >
          {formatDateRange(project.startDate, project.endDate)}
        </span>
      </div>
      {project.technologies.length > 0 ? (
        <p
          style={{
            margin: '2px 0 4px',
            fontSize: baseSize - 1.5,
            color: accent,
            fontWeight: 600,
          }}
        >
          {project.technologies.join(' · ')}
        </p>
      ) : null}
      {project.description ? (
        <p
          style={{
            margin: 0,
            fontSize: baseSize - 0.5,
            color: '#475569',
            lineHeight,
          }}
        >
          {project.description}
        </p>
      ) : null}
    </div>
  )
}

function CustomSectionBlock({
  section,
  baseSize,
  lineHeight,
  accent,
}: {
  section: CustomSection
  baseSize: number
  lineHeight: number
  accent: string
}) {
  return (
    <Bullets
      items={section.items}
      size={baseSize - 0.5}
      accent={accent}
      lineHeight={lineHeight}
    />
  )
}

/** Render the main-column sections in their configured order. */
function MainSections({
  resume,
  common,
  headingVariant = 'rule',
  accentText = '#0f172a',
  sidebarIds = [],
}: {
  resume: Resume
  common: CommonProps
  headingVariant?: 'rule' | 'bar' | 'thin' | 'heavy'
  accentText?: string
  sidebarIds?: SectionId[]
}) {
  const { visible, accent, baseSize, headingSize, lineHeight } = common
  const content: React.ReactNode[] = []

  for (const sectionId of visible) {
    if (sidebarIds.includes(sectionId)) continue
    let body: React.ReactNode = null
    let title = ''

    switch (sectionId) {
      case 'summary':
        if (!resume.summary) continue
        title = 'Summary'
        body = (
          <p
            style={{
              margin: 0,
              fontSize: baseSize,
              color: '#334155',
              lineHeight,
            }}
          >
            {resume.summary}
          </p>
        )
        break
      case 'experience':
        if (resume.experiences.length === 0) continue
        title = 'Experience'
        body = (
          <div>
            {resume.experiences.map((exp) => (
              <ExperienceEntry
                key={exp.id}
                exp={exp}
                baseSize={baseSize}
                lineHeight={lineHeight}
                accent={accent}
                headingSize={headingSize}
              />
            ))}
          </div>
        )
        break
      case 'education':
        if (resume.educations.length === 0) continue
        title = 'Education'
        body = (
          <div>
            {resume.educations.map((edu) => (
              <EducationEntry
                key={edu.id}
                edu={edu}
                baseSize={baseSize}
                lineHeight={lineHeight}
                accent={accent}
                headingSize={headingSize}
              />
            ))}
          </div>
        )
        break
      case 'skills':
        if (resume.skills.length === 0) continue
        title = 'Skills'
        body = (
          <SkillsBlock
            skills={resume.skills}
            accent={accent}
            baseSize={baseSize}
            lineHeight={lineHeight}
          />
        )
        break
      case 'certifications':
        if (resume.certifications.length === 0) continue
        title = 'Certifications'
        body = (
          <div>
            {resume.certifications.map((cert: Certification) => (
              <CertificationEntry
                key={cert.id}
                cert={cert}
                baseSize={baseSize}
                accent={accent}
              />
            ))}
          </div>
        )
        break
      case 'languages':
        if (resume.languages.length === 0) continue
        title = 'Languages'
        body = (
          <LanguagesBlock
            languages={resume.languages}
            color="#334155"
            baseSize={baseSize}
            lineHeight={lineHeight}
            accent={accent}
          />
        )
        break
      case 'projects':
        if (resume.projects.length === 0) continue
        title = 'Projects'
        body = (
          <div>
            {resume.projects.map((project: Project) => (
              <ProjectEntry
                key={project.id}
                project={project}
                baseSize={baseSize}
                lineHeight={lineHeight}
                accent={accent}
              />
            ))}
          </div>
        )
        break
      case 'custom':
        if (resume.customSections.length === 0) continue
        title = resume.customSections[0]?.title || 'Additional Information'
        body = (
          <div>
            {resume.customSections.map((section: CustomSection) => (
              <div key={section.id} style={{ marginBottom: 10 }}>
                <p
                  style={{
                    margin: '0 0 4px',
                    fontSize: headingSize,
                    fontWeight: 700,
                    color: '#0f172a',
                  }}
                >
                  {section.title}
                </p>
                <CustomSectionBlock
                  section={section}
                  baseSize={baseSize}
                  lineHeight={lineHeight}
                  accent={accent}
                />
              </div>
            ))}
          </div>
        )
        break
    }

    content.push(
      <React.Fragment key={sectionId}>
        <SectionHeading
          title={title}
          accent={accent}
          headingSize={headingSize}
          variant={headingVariant}
          color={accentText}
        />
        {body}
      </React.Fragment>,
    )
  }

  return <div>{content}</div>
}

/* ───────────────────────────────────────────
 * Template layouts
 * ─────────────────────────────────────────── */

function HeaderBase({
  resume,
  accent,
  baseSize,
  headingSize,
  align = 'left',
  nameColor = '#0f172a',
}: {
  resume: Resume
  accent: string
  baseSize: number
  headingSize: number
  align?: 'left' | 'center'
  nameColor?: string
}) {
  const { personalInfo } = resume
  const contactItems = [
    personalInfo.email,
    personalInfo.phone,
    [personalInfo.city, personalInfo.country].filter(Boolean).join(', '),
    personalInfo.website,
    personalInfo.linkedin,
    personalInfo.github,
  ]

  return (
    <div style={{ textAlign: align }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          justifyContent: align === 'center' ? 'center' : 'flex-start',
        }}
      >
        {personalInfo.photo ? (
          <img
            src={personalInfo.photo}
            alt=""
            style={{
              width: headingSize * 5,
              height: headingSize * 5,
              borderRadius: '50%',
              objectFit: 'cover',
              border: `2px solid ${accent}`,
            }}
          />
        ) : null}
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: headingSize * 2.2,
              fontWeight: 800,
              letterSpacing: '-0.01em',
              color: nameColor,
              fontFamily: 'inherit',
            }}
          >
            {personalInfo.fullName || 'Your Name'}
          </h1>
          <p
            style={{
              margin: '4px 0 0',
              fontSize: baseSize + 2,
              fontWeight: 600,
              color: accent,
            }}
          >
            {personalInfo.jobTitle}
          </p>
        </div>
      </div>
      <ContactLine items={contactItems} color="#64748b" size={baseSize - 1} />
    </div>
  )
}

function ModernLayout({
  resume,
  accent,
  baseSize,
  headingSize,
  lineHeight,
  fontFamily,
  visible,
  padding,
}: CommonProps & { padding: Padding }) {
  const { personalInfo, skills, languages } = resume
  const sidebarVisible =
    visible.includes('skills') || visible.includes('languages')
  const sidebarItems = [
    personalInfo.email && { label: 'Email', value: personalInfo.email },
    personalInfo.phone && { label: 'Phone', value: personalInfo.phone },
    [personalInfo.city, personalInfo.state, personalInfo.country]
      .filter(Boolean)
      .join(', ') && {
      label: 'Location',
      value: [personalInfo.city, personalInfo.state, personalInfo.country]
        .filter(Boolean)
        .join(', '),
    },
    personalInfo.website && { label: 'Website', value: personalInfo.website },
    personalInfo.linkedin && {
      label: 'LinkedIn',
      value: personalInfo.linkedin,
    },
    personalInfo.github && { label: 'GitHub', value: personalInfo.github },
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        fontFamily,
        lineHeight,
        background: '#ffffff',
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: 280,
          flexShrink: 0,
          background: accent,
          color: '#fff',
          padding: `${padding.top}px ${Math.max(18, padding.left - 10)}px`,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: headingSize * 2,
            fontWeight: 800,
            letterSpacing: '-0.01em',
          }}
        >
          {personalInfo.fullName || 'Your Name'}
        </h1>
        <p
          style={{
            margin: '4px 0 0',
            fontSize: baseSize + 1,
            fontWeight: 600,
            opacity: 0.9,
          }}
        >
          {personalInfo.jobTitle}
        </p>

        {sidebarItems.length > 0 ? (
          <div style={{ marginTop: 22 }}>
            {sidebarItems.map((item) => (
              <p
                key={item.label}
                style={{
                  margin: '0 0 8px',
                  fontSize: baseSize - 1,
                  color: 'rgba(255,255,255,0.92)',
                  lineHeight: 1.45,
                  wordBreak: 'break-word',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    fontSize: baseSize - 3,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    opacity: 0.7,
                    marginBottom: 1,
                  }}
                >
                  {item.label}
                </span>
                {item.value}
              </p>
            ))}
          </div>
        ) : null}

        {visible.includes('skills') && skills.length > 0 ? (
          <div style={{ marginTop: 24 }}>
            <h3
              style={{
                margin: '0 0 10px',
                fontSize: headingSize,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Skills
            </h3>
            <SidebarSkills
              skills={skills}
              accent="#ffffff"
              baseSize={baseSize}
              lineHeight={lineHeight}
            />
          </div>
        ) : null}

        {visible.includes('languages') && languages.length > 0 ? (
          <div style={{ marginTop: 24 }}>
            <h3
              style={{
                margin: '0 0 10px',
                fontSize: headingSize,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Languages
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {languages.map((lang) => (
                <p
                  key={lang.id}
                  style={{
                    margin: 0,
                    fontSize: baseSize - 1,
                    color: 'rgba(255,255,255,0.92)',
                  }}
                >
                  {lang.name}{' '}
                  <span style={{ opacity: 0.7, textTransform: 'capitalize' }}>
                    — {lang.proficiency}
                  </span>
                </p>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Main column */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${Math.max(18, padding.left)}px`,
        }}
      >
        {resume.summary && visible.includes('summary') ? (
          <>
            <SectionHeading
              title="Summary"
              accent={accent}
              headingSize={headingSize}
            />
            <p
              style={{
                margin: 0,
                fontSize: baseSize,
                color: '#334155',
                lineHeight,
              }}
            >
              {resume.summary}
            </p>
          </>
        ) : null}
        <MainSections
          resume={resume}
          common={{
            resume,
            accent,
            baseSize,
            headingSize,
            lineHeight,
            fontFamily,
            visible,
          }}
          sidebarIds={['summary', 'skills', 'languages']}
        />
      </div>
    </div>
  )
}

function ClassicLayout({
  resume,
  accent,
  baseSize,
  headingSize,
  lineHeight,
  fontFamily,
  visible,
  padding,
}: CommonProps & { padding: Padding }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
        fontFamily,
        lineHeight,
        background: '#ffffff',
      }}
    >
      <HeaderBase
        resume={resume}
        accent={accent}
        baseSize={baseSize}
        headingSize={headingSize}
        align="center"
      />
      <div
        style={{
          margin: '14px auto 0',
          height: 2,
          background: accent,
          width: 64,
        }}
      />
      <MainSections
        resume={resume}
        common={{
          resume,
          accent,
          baseSize,
          headingSize,
          lineHeight,
          fontFamily,
          visible,
        }}
      />
    </div>
  )
}

function ProfessionalLayout({
  resume,
  accent,
  baseSize,
  headingSize,
  lineHeight,
  fontFamily,
  visible,
  padding,
}: CommonProps & { padding: Padding }) {
  const { personalInfo } = resume
  const contactItems = [
    personalInfo.email,
    personalInfo.phone,
    [personalInfo.city, personalInfo.country].filter(Boolean).join(', '),
    personalInfo.website,
    personalInfo.linkedin,
    personalInfo.github,
  ].filter(Boolean)

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        fontFamily,
        lineHeight,
        background: '#ffffff',
      }}
    >
      <div
        style={{
          background: accent,
          padding: `${Math.max(22, padding.top)}px ${padding.right}px 18px ${padding.left}px`,
          color: '#fff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {personalInfo.photo ? (
            <img
              src={personalInfo.photo}
              alt=""
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid rgba(255,255,255,0.8)',
              }}
            />
          ) : null}
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: headingSize * 2.3,
                fontWeight: 800,
                letterSpacing: '0.01em',
              }}
            >
              {personalInfo.fullName || 'Your Name'}
            </h1>
            <p
              style={{
                margin: '3px 0 0',
                fontSize: baseSize + 2,
                fontWeight: 600,
                opacity: 0.95,
              }}
            >
              {personalInfo.jobTitle}
            </p>
          </div>
        </div>
        <ContactLine
          items={contactItems}
          color="rgba(255,255,255,0.85)"
          size={baseSize - 1}
        />
      </div>
      <div
        style={{
          padding: `18px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
        }}
      >
        <MainSections
          resume={resume}
          common={{
            resume,
            accent,
            baseSize,
            headingSize,
            lineHeight,
            fontFamily,
            visible,
          }}
          headingVariant="thin"
        />
      </div>
    </div>
  )
}

function ExecutiveLayout({
  resume,
  accent,
  baseSize,
  headingSize,
  lineHeight,
  fontFamily,
  visible,
  padding,
}: CommonProps & { padding: Padding }) {
  const { personalInfo } = resume
  const contactItems = [
    personalInfo.email,
    personalInfo.phone,
    [personalInfo.city, personalInfo.country].filter(Boolean).join(', '),
    personalInfo.website,
    personalInfo.linkedin,
  ].filter(Boolean)

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
        fontFamily,
        lineHeight,
        background: '#ffffff',
      }}
    >
      <div style={{ borderTop: `6px solid ${accent}`, paddingTop: 18 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: headingSize * 2.4,
                fontWeight: 800,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                color: '#0f172a',
              }}
            >
              {personalInfo.fullName || 'Your Name'}
            </h1>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: baseSize + 1.5,
                fontWeight: 600,
                color: accent,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              {personalInfo.jobTitle}
            </p>
          </div>
          {personalInfo.photo ? (
            <img
              src={personalInfo.photo}
              alt=""
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                objectFit: 'cover',
                border: `2px solid ${accent}`,
              }}
            />
          ) : null}
        </div>
        <div
          style={{
            marginTop: 10,
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 6,
          }}
        >
          {contactItems.map((item, index) => (
            <span
              key={index}
              style={{ fontSize: baseSize - 1.5, color: '#475569' }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
      <MainSections
        resume={resume}
        common={{
          resume,
          accent,
          baseSize,
          headingSize,
          lineHeight,
          fontFamily,
          visible,
        }}
        headingVariant="thin"
        accentText="#0f172a"
      />
    </div>
  )
}

function CreativeLayout({
  resume,
  accent,
  baseSize,
  headingSize,
  lineHeight,
  fontFamily,
  visible,
  padding,
}: CommonProps & { padding: Padding }) {
  const { personalInfo, skills, languages } = resume
  const contactItems = [
    personalInfo.email,
    personalInfo.phone,
    [personalInfo.city, personalInfo.country].filter(Boolean).join(', '),
    personalInfo.website,
    personalInfo.linkedin,
    personalInfo.github,
  ].filter(Boolean)

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily,
        lineHeight,
        background: '#ffffff',
      }}
    >
      {/* Top band */}
      <div
        style={{
          background: accent,
          padding: `${Math.max(20, padding.top)}px ${padding.right}px 16px ${padding.left}px`,
          color: '#fff',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: headingSize * 2.2,
                fontWeight: 800,
                letterSpacing: '-0.01em',
              }}
            >
              {personalInfo.fullName || 'Your Name'}
            </h1>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: baseSize + 2,
                fontWeight: 600,
                opacity: 0.95,
              }}
            >
              {personalInfo.jobTitle}
            </p>
          </div>
          {personalInfo.photo ? (
            <img
              src={personalInfo.photo}
              alt=""
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid rgba(255,255,255,0.85)',
              }}
            />
          ) : null}
        </div>
        <ContactLine
          items={contactItems}
          color="rgba(255,255,255,0.9)"
          size={baseSize - 1}
        />
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Main */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            padding: `14px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
          }}
        >
          <MainSections
            resume={resume}
            common={{
              resume,
              accent,
              baseSize,
              headingSize,
              lineHeight,
              fontFamily,
              visible,
            }}
            headingVariant="bar"
            sidebarIds={['skills', 'languages']}
          />
        </div>
        {/* Sidebar */}
        <div
          style={{
            width: 230,
            flexShrink: 0,
            borderLeft: `4px solid ${accent}`,
            background: '#f8fafc',
            padding: `14px 16px ${padding.bottom}px`,
          }}
        >
          {visible.includes('skills') && skills.length > 0 ? (
            <div style={{ marginBottom: 18 }}>
              <h3
                style={{
                  margin: '0 0 10px',
                  fontSize: headingSize,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: accent,
                }}
              >
                Skills
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {skills.map((skill) => (
                  <span
                    key={skill.id}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 999,
                      background: `${accent}18`,
                      color: '#0f172a',
                      fontSize: baseSize - 1.5,
                      fontWeight: 600,
                    }}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {visible.includes('languages') && languages.length > 0 ? (
            <div>
              <h3
                style={{
                  margin: '0 0 10px',
                  fontSize: headingSize,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: accent,
                }}
              >
                Languages
              </h3>
              <LanguagesBlock
                languages={languages}
                color="#334155"
                baseSize={baseSize}
                lineHeight={lineHeight}
                accent={accent}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function SafetyLayout({
  resume,
  accent,
  baseSize,
  headingSize,
  lineHeight,
  fontFamily,
  visible,
  padding,
}: CommonProps & { padding: Padding }) {
  const { personalInfo, skills, languages } = resume
  const sidebarItems = [
    personalInfo.email && { label: 'Email', value: personalInfo.email },
    personalInfo.phone && { label: 'Phone', value: personalInfo.phone },
    [personalInfo.city, personalInfo.state, personalInfo.country]
      .filter(Boolean)
      .join(', ') && {
      label: 'Location',
      value: [personalInfo.city, personalInfo.state, personalInfo.country]
        .filter(Boolean)
        .join(', '),
    },
    personalInfo.website && { label: 'Website', value: personalInfo.website },
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        fontFamily,
        lineHeight,
        background: '#ffffff',
      }}
    >
      {/* Dark industrial sidebar */}
      <div
        style={{
          width: 250,
          flexShrink: 0,
          background: '#1e293b',
          color: '#fff',
          padding: `${padding.top}px 18px ${padding.bottom}px`,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: headingSize * 1.9,
            fontWeight: 800,
            letterSpacing: '0.01em',
            lineHeight: 1.15,
          }}
        >
          {personalInfo.fullName || 'Your Name'}
        </h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: baseSize + 1,
            fontWeight: 700,
            color: accent,
          }}
        >
          {personalInfo.jobTitle}
        </p>
        <div style={{ marginTop: 14, height: 3, background: accent }} />

        {sidebarItems.length > 0 ? (
          <div style={{ marginTop: 20 }}>
            {sidebarItems.map((item) => (
              <p
                key={item.label}
                style={{
                  margin: '0 0 9px',
                  fontSize: baseSize - 1,
                  color: 'rgba(255,255,255,0.9)',
                  wordBreak: 'break-word',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    fontSize: baseSize - 3,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: accent,
                    marginBottom: 1,
                  }}
                >
                  {item.label}
                </span>
                {item.value}
              </p>
            ))}
          </div>
        ) : null}

        {visible.includes('skills') && skills.length > 0 ? (
          <div style={{ marginTop: 22 }}>
            <h3
              style={{
                margin: '0 0 10px',
                fontSize: headingSize,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: accent,
              }}
            >
              Skills
            </h3>
            <SidebarSkills
              skills={skills}
              accent={accent}
              baseSize={baseSize}
              lineHeight={lineHeight}
            />
          </div>
        ) : null}

        {visible.includes('languages') && languages.length > 0 ? (
          <div style={{ marginTop: 22 }}>
            <h3
              style={{
                margin: '0 0 10px',
                fontSize: headingSize,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: accent,
              }}
            >
              Languages
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {languages.map((lang) => (
                <p
                  key={lang.id}
                  style={{
                    margin: 0,
                    fontSize: baseSize - 1,
                    color: 'rgba(255,255,255,0.9)',
                  }}
                >
                  {lang.name}{' '}
                  <span style={{ color: accent, textTransform: 'capitalize' }}>
                    — {lang.proficiency}
                  </span>
                </p>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Main column */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${Math.max(18, padding.left)}px`,
        }}
      >
        {resume.summary && visible.includes('summary') ? (
          <>
            <SectionHeading
              title="Summary"
              accent={accent}
              headingSize={headingSize}
              variant="heavy"
            />
            <p
              style={{
                margin: 0,
                fontSize: baseSize,
                color: '#334155',
                lineHeight,
              }}
            >
              {resume.summary}
            </p>
          </>
        ) : null}
        <MainSections
          resume={resume}
          common={{
            resume,
            accent,
            baseSize,
            headingSize,
            lineHeight,
            fontFamily,
            visible,
          }}
          headingVariant="heavy"
          sidebarIds={['summary', 'skills', 'languages']}
        />
      </div>
    </div>
  )
}
