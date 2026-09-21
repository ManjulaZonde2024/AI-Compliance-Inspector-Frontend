import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import heroAsset from '../assets/hero.png'
import { Reveal } from '../components/ui/Reveal'
import { ThemeToggle } from '../components/ui/ThemeToggle'

const lightAction = 'inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-semibold text-navy shadow-sm ring-1 ring-white/30 transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:bg-brand-light hover:shadow-md active:scale-[0.98] focus-visible:outline-white'
const outlineAction = 'inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/20 bg-white/[0.07] px-5 text-sm font-semibold text-white transition-[background-color,border-color,transform] duration-200 hover:-translate-y-px hover:border-white/40 hover:bg-white/[0.12] active:scale-[0.98] focus-visible:outline-white'

const capabilities = [
  ['Label and image inspection', 'Analyze packaged-commodity views without changing downstream image-processing contracts.'],
  ['Mandatory declaration checks', 'Compare extracted declarations against returned rule requirements and expected fields.'],
  ['Readability and presentation', 'Highlight legibility, placement, and visibility issues from submitted label images.'],
  ['Evidence-backed findings', 'Connect each returned finding to supporting product evidence for officer inspection.'],
  ['Inspection history', 'Keep completed records easy to reopen across result, evidence, and report screens.'],
  ['Compliance reports', 'Prepare structured outputs that remain easy to connect to real backend JSON.'],
] as const

function BrandMark() {
  return <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand text-sm font-semibold text-white shadow-sm" aria-hidden="true">PD</span>
}

function LabelCanvas() {
  return (
    <div className="relative min-h-[20rem] overflow-hidden rounded-lg border border-border bg-[#f8fafc] p-4 shadow-inner sm:min-h-[23rem] sm:p-5">
      <div className="absolute inset-y-0 left-1/2 w-px bg-border/70" aria-hidden="true" />
      <div className="absolute inset-x-6 top-10 h-28 rounded-full bg-brand/10 blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto max-w-[18rem] border border-slate-300 bg-white px-5 py-4 shadow-[0_18px_42px_rgb(15_23_42_/_0.12)] transition-transform duration-300 hover:-translate-y-1">
        <div className="border-b-2 border-navy pb-3">
          <p className="text-[9px] font-semibold uppercase text-brand">Everyday Care</p>
          <p className="mt-1 text-[10px] text-muted">Illustrative packaged-commodity label</p>
        </div>
        <div className="mt-4 flex items-start justify-between">
          <div>
            <p className="text-2xl font-semibold text-navy">CARE</p>
            <p className="mt-1 text-[9px] uppercase text-muted">Daily essentials</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-brand/20 bg-brand-light text-brand" aria-hidden="true">ID</span>
        </div>
        <div className="mt-5 space-y-2 text-[9px] text-muted">
          <p>Example Consumer Products</p>
          <p>Net quantity: 250 g</p>
          <p>MRP: <span className="inline-block whitespace-nowrap rounded-[3px] border-[1.5px] border-warning bg-warning/10 px-1 leading-[1.6] text-ink">returned field</span></p>
          <p>Packed on: <span className="inline-block whitespace-nowrap rounded-[3px] border-[1.5px] border-danger bg-danger/10 px-1 leading-[1.6] text-ink">returned field</span></p>
          <p>Consumer care: contact field</p>
        </div>
        <div className="mt-5 border-t border-border pt-3 text-[8px] leading-4 text-slate-400">Fictional preview content for product demonstration.</div>
      </div>
      <div className="absolute left-3 top-3 flex items-center gap-2 rounded-md border border-brand/20 bg-white px-2.5 py-1.5 text-[10px] font-medium text-brand shadow-sm sm:left-5 sm:top-5"><span className="h-1.5 w-1.5 rounded-full bg-brand" />Label image</div>
      <div className="absolute bottom-3 right-3 rounded-md border border-danger/20 bg-white px-2.5 py-1.5 text-[10px] font-medium text-danger shadow-sm sm:bottom-5 sm:right-5">2 violations detected</div>
    </div>
  )
}

function InspectionConsole() {
  return (
    <div className="welcome-console relative overflow-hidden rounded-lg border border-white/15 bg-white p-3 shadow-[0_30px_80px_rgb(11_31_58_/_0.34)] transition-transform duration-300 hover:-translate-y-0.5 sm:p-4">
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-brand/10 blur-3xl" aria-hidden="true" />
      <div className="relative flex items-center justify-between border-b border-border px-1 pb-3">
        <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-success" /><span className="text-[10px] font-semibold uppercase text-muted">Inspection workspace</span></div>
        <span className="font-mono text-[10px] text-slate-400">AUTO / RESULT</span>
      </div>
      <div className="relative grid gap-3 pt-3 lg:grid-cols-[minmax(0,1.08fr)_minmax(13rem,0.92fr)]">
        <LabelCanvas />
        <div className="flex flex-col gap-3">
          <div className="rounded-md border border-border bg-bg p-4">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-[10px] font-semibold uppercase text-muted">Declaration analysis</p><h3 className="mt-1 text-base font-semibold text-ink">Extracted information</h3></div>
              <span className="rounded-md bg-success/10 px-2 py-1 text-[10px] font-medium text-success">OCR complete</span>
            </div>
            <dl className="mt-4 divide-y divide-border text-xs">
              <div className="flex justify-between gap-3 py-2"><dt className="text-muted">Manufacturer</dt><dd className="text-right font-medium text-ink">Example Consumer Products</dd></div>
              <div className="flex justify-between gap-3 py-2"><dt className="text-muted">Net quantity</dt><dd className="font-medium text-ink">250 g</dd></div>
              <div className="flex justify-between gap-3 py-2"><dt className="text-muted">MRP</dt><dd className="font-medium text-ink">Returned</dd></div>
              <div className="flex justify-between gap-3 py-2"><dt className="text-muted">Consumer care</dt><dd className="font-medium text-ink">Contact field</dd></div>
            </dl>
          </div>
          <div className="rounded-md border border-danger/25 bg-danger/5 p-4">
            <div className="flex items-center justify-between"><p className="text-[10px] font-semibold uppercase text-danger">Automated compliance result</p><span className="text-xs font-semibold text-danger">2 findings</span></div>
            <p className="mt-2 text-sm font-semibold text-ink">Non-compliant declaration gaps detected</p>
            <p className="mt-1 text-xs leading-5 text-muted">Returned rules, extracted fields, and image evidence are linked for inspection.</p>
            <div className="mt-3 flex items-center justify-between text-[11px]"><span className="text-muted">Score generated</span><span className="font-semibold text-ink">72/100</span></div>
          </div>
          <div className="rounded-md border border-border bg-navy px-4 py-3 text-white">
            <div className="flex items-center justify-between">
              <div><p className="text-[10px] uppercase text-white/50">Inspection report</p><p className="mt-1 text-xs font-medium">Structured output generated</p></div>
              <span className="rounded-md bg-success px-2 py-1 text-xs font-semibold" aria-hidden="true">OK</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-3 text-[10px] font-semibold uppercase text-muted">
        <span>Upload</span><span className="text-brand">Analyze</span><span className="text-warning">Detect</span><span className="text-danger">Score</span><span className="text-navy">Report</span>
      </div>
    </div>
  )
}

function MiniResult() {
  return <div className="welcome-surface rounded-lg border border-border bg-white p-4 shadow-sm transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase text-muted">Compliance status</p><h3 className="mt-1 text-xl font-semibold text-ink">Non-compliant</h3></div><span className="rounded-md bg-danger/10 px-2 py-1 text-[10px] font-medium text-danger">2 findings</span></div><div className="mt-5 flex items-center gap-3"><div className="h-2 flex-1 overflow-hidden rounded-full bg-bg"><div className="h-full w-[72%] rounded-full bg-danger" /></div><span className="text-sm font-semibold text-ink">72/100</span></div><div className="mt-5 space-y-2"><div className="flex items-center justify-between border-t border-border pt-3 text-xs"><span className="font-medium text-ink">Declaration field</span><span className="text-danger">High severity</span></div><div className="flex items-center justify-between border-t border-border pt-3 text-xs"><span className="font-medium text-ink">Presentation field</span><span className="text-warning">Medium severity</span></div></div><span className="mt-5 inline-flex text-xs font-semibold text-brand">Review evidence</span></div>
}

function MiniEvidence() {
  return <div className="welcome-surface rounded-lg border border-border bg-white p-4 shadow-sm transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase text-muted">Evidence workspace</p><h3 className="mt-1 text-lg font-semibold text-ink">Supporting image</h3></div><span className="font-mono text-[10px] text-muted">01 / 02</span></div><div className="relative mt-4 flex h-36 items-center justify-center overflow-hidden rounded-md border border-border bg-slate-100"><div className="relative h-28 w-24 border border-slate-300 bg-white p-2 shadow-sm"><div className="h-2 w-12 bg-navy" /><div className="mt-3 space-y-2"><div className="h-1.5 w-full bg-slate-200" /><div className="h-1.5 w-4/5 bg-slate-200" /><div className="h-1.5 w-full bg-slate-200" /></div><span className="absolute left-2 top-11 h-6 w-16 border-2 border-danger bg-danger/10" /></div></div><div className="mt-4 grid grid-cols-2 gap-3 text-xs"><div><p className="text-muted">Detected</p><p className="mt-1 font-medium text-ink">Returned label field</p></div><div><p className="text-muted">Required</p><p className="mt-1 font-medium text-ink">Expected information</p></div></div></div>
}

function MiniReport() {
  return <div className="welcome-surface rounded-lg border border-border bg-white p-4 shadow-sm transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-center justify-between border-b-2 border-navy pb-3"><div><p className="text-[10px] font-semibold uppercase text-brand">Inspection report</p><h3 className="mt-1 text-lg font-semibold text-navy">Compliance record</h3></div><span className="rounded-md bg-danger/10 px-2 py-1 text-[10px] font-medium text-danger">Non-compliant</span></div><dl className="mt-4 grid grid-cols-2 gap-4 text-xs"><div><dt className="text-muted">Inspection</dt><dd className="mt-1 font-medium text-ink">INS-2026-014</dd></div><div><dt className="text-muted">Product</dt><dd className="mt-1 font-medium text-ink">Everyday Care</dd></div><div><dt className="text-muted">Findings</dt><dd className="mt-1 font-medium text-ink">2 returned</dd></div><div><dt className="text-muted">Evidence</dt><dd className="mt-1 font-medium text-ink">2 items</dd></div></dl><div className="mt-5 flex items-center justify-between border-t border-border pt-3 text-xs"><span className="text-muted">Report status</span><span className="font-medium text-success">Generated</span></div></div>
}

function PipelineStage({ stage, title, children }: { stage: string; title: string; children: ReactNode }) {
  const [number, label] = stage.split(' / ')
  return (
    <div className="welcome-step min-w-0 flex-1 rounded-lg border border-border bg-surface p-4 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted"><span className="font-mono text-brand">{number}</span>{label ? ` / ${label}` : ''}</p>
      <h3 className="mt-1 text-sm font-semibold text-ink">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  )
}

function PipelineConnector() {
  return (
    <div className="flex shrink-0 items-center justify-center" aria-hidden="true">
      <span className="flex flex-col items-center lg:flex-row">
        <span className="h-3 w-px bg-brand/30 lg:h-px lg:w-4" />
        <span className="my-0.5 h-1.5 w-1.5 rotate-45 rounded-[1px] bg-brand/50 lg:mx-0.5 lg:my-0" />
        <span className="h-3 w-px bg-brand/30 lg:h-px lg:w-4" />
      </span>
    </div>
  )
}

export function WelcomePage() {
  return <div className="min-h-svh overflow-hidden bg-bg text-ink">
    <header className="border-b border-border/80 bg-surface/95 backdrop-blur"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-10"><Link to="/" className="flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-brand"><BrandMark /><span className="truncate text-sm font-semibold text-ink sm:text-base">Packet Decoder</span></Link><nav className="flex items-center gap-1.5" aria-label="Public navigation"><ThemeToggle /><Link to="/signin" className="rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-bg hover:text-ink focus-visible:outline-brand">Sign in</Link><Link to="/dashboard" className="inline-flex h-9 items-center rounded-md bg-brand px-3.5 text-sm font-semibold text-white shadow-sm transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:bg-brand-dark hover:shadow-md active:scale-[0.98] focus-visible:outline-brand">Get started</Link></nav></div></header>
    <main>
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(122,62,104,0.32),transparent_34%),linear-gradient(125deg,rgba(255,255,255,0.06),transparent_48%,rgba(181,107,152,0.12))]" aria-hidden="true" />
        <div className="absolute right-[8%] top-12 hidden h-44 w-44 rounded-full border border-white/10 lg:block" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-14 sm:px-8 sm:pt-18 lg:px-10 lg:pb-14 lg:pt-20">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(21rem,0.72fr)_minmax(0,1.28fr)] lg:gap-12">
            <div className="welcome-enter max-w-xl">
              <p className="text-xs font-semibold uppercase text-white/60">Legal Metrology inspection workflow</p>
              <h1 className="mt-5 text-4xl font-semibold tracking-normal sm:text-5xl lg:text-[4.05rem] lg:leading-[1.04]">Inspect smart.<br /><span className="text-white/90">Verify compliance.</span></h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-white/75 sm:text-lg">Analyze packaged-commodity labels, detect declaration gaps, calculate automated compliance outcomes, and generate evidence-backed reports.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link to="/dashboard" className={lightAction}>Get started <span aria-hidden="true">-&gt;</span></Link><Link to="/signin" className={outlineAction}>Sign in</Link></div>
              <div className="mt-8 grid grid-cols-3 gap-3 text-center sm:max-w-md">
                <div className="rounded-md border border-white/10 bg-white/[0.06] px-3 py-3"><p className="text-lg font-semibold">OCR</p><p className="mt-1 text-[10px] uppercase text-white/55">Extraction</p></div>
                <div className="rounded-md border border-white/10 bg-white/[0.06] px-3 py-3"><p className="text-lg font-semibold">Rules</p><p className="mt-1 text-[10px] uppercase text-white/55">Evaluation</p></div>
                <div className="rounded-md border border-white/10 bg-white/[0.06] px-3 py-3"><p className="text-lg font-semibold">Score</p><p className="mt-1 text-[10px] uppercase text-white/55">Outcome</p></div>
              </div>
            </div>
            <div className="relative">
              <img src={heroAsset} alt="" className="pointer-events-none absolute -right-5 -top-10 hidden w-36 opacity-75 drop-shadow-2xl sm:block" />
              <InspectionConsole />
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-16" aria-labelledby="workflow-heading"><Reveal><div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-xs font-semibold uppercase text-brand">Inspection pipeline</p><h2 id="workflow-heading" className="mt-3 text-3xl font-semibold tracking-normal text-ink">From packaging image to verified compliance.</h2></div><p className="max-w-md text-sm leading-6 text-muted">Packet Decoder connects label inspection, declaration extraction, rule evaluation, evidence, and reporting in one workflow.</p></div><div className="mt-10 rounded-xl border border-border/70 p-3 sm:p-4"><div className="flex flex-col items-stretch gap-2 lg:flex-row">
        <PipelineStage stage="01 / Label image" title="Product label">
          <div className="rounded-md border border-slate-300 bg-white p-3">
            <p className="text-[8px] font-semibold uppercase text-brand">Everyday Care</p>
            <p className="mt-0.5 text-sm font-semibold text-navy">CARE</p>
            <div className="mt-2 space-y-1 text-[8px] text-muted">
              <p>Mfg. Date: <span className="inline-block whitespace-nowrap rounded-[3px] border-[1.5px] border-warning bg-warning/10 px-1 leading-[1.6] text-ink">05/2026</span></p>
              <p>Expiry Date: <span className="inline-block whitespace-nowrap rounded-[3px] border-[1.5px] border-danger bg-danger/10 px-1 leading-[1.6] text-ink">10/2027</span></p>
              <p>MRP: <span className="inline-block whitespace-nowrap rounded-[3px] border-[1.5px] border-brand bg-brand/10 px-1 leading-[1.6] text-ink">₹373</span></p>
            </div>
          </div>
        </PipelineStage>
        <PipelineConnector />
        <PipelineStage stage="02 / Extraction" title="Extracted data">
          <dl className="divide-y divide-border rounded-md border border-border bg-bg text-[11px]">
            <div className="flex items-center justify-between gap-2 px-3 py-2"><dt className="text-muted">Manufacturer</dt><dd className="truncate font-medium text-ink">Example Products</dd></div>
            <div className="flex items-center justify-between gap-2 px-3 py-2"><dt className="text-muted">Net quantity</dt><dd className="font-medium text-ink">250 g</dd></div>
            <div className="flex items-center justify-between gap-2 px-3 py-2"><dt className="text-muted">MRP</dt><dd className="font-medium text-danger">Returned</dd></div>
            <div className="flex items-center justify-between gap-2 px-3 py-2"><dt className="text-muted">Date</dt><dd className="font-medium text-ink">05/2026</dd></div>
          </dl>
        </PipelineStage>
        <PipelineConnector />
        <PipelineStage stage="03 / Evaluation" title="Rule check">
          <p className="mb-2 text-[10px] uppercase tracking-wide text-muted">Checked against declaration requirements</p>
          <ul className="space-y-2 rounded-md border border-border bg-bg p-3 text-[11px]">
            <li className="flex items-center justify-between gap-2"><span className="text-muted">Net quantity</span><span className="font-medium text-success">Present</span></li>
            <li className="flex items-center justify-between gap-2"><span className="text-muted">MRP declaration</span><span className="font-medium text-danger">Missing</span></li>
            <li className="flex items-center justify-between gap-2"><span className="text-muted">Date declaration</span><span className="font-medium text-warning">Check</span></li>
          </ul>
        </PipelineStage>
        <PipelineConnector />
        <PipelineStage stage="04 / Outcome" title="Compliance result">
          <div className="rounded-md border border-danger/40 bg-danger/[0.07] p-3 shadow-sm">
            <div className="flex items-center justify-between"><span className="text-base font-semibold text-ink">72/100</span><span className="rounded-md bg-danger/10 px-2 py-0.5 text-[10px] font-medium text-danger">Non-compliant</span></div>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-bg"><div className="h-full w-[72%] rounded-full bg-danger" /></div>
            <p className="mt-2 text-[11px] text-muted">2 declaration findings</p>
          </div>
        </PipelineStage>
        <PipelineConnector />
        <PipelineStage stage="05 / Record" title="Evidence + report">
          <div className="space-y-2 rounded-md border border-border bg-bg p-3 text-[11px]">
            <div className="flex items-center justify-between gap-2"><span className="text-muted">Findings</span><span className="font-medium text-ink">2</span></div>
            <div className="flex items-center justify-between gap-2"><span className="text-muted">Evidence</span><span className="font-medium text-ink">2 items</span></div>
            <div className="flex items-center justify-between gap-2"><span className="text-muted">Report status</span><span className="font-medium text-success">Generated</span></div>
            <p className="border-t border-border pt-2 font-mono text-[10px] text-muted">INS-2026-014</p>
          </div>
        </PipelineStage>
      </div></div></Reveal></section>
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-16" aria-labelledby="capabilities-heading"><Reveal><div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start"><div><p className="text-xs font-semibold uppercase text-brand">Practical coverage</p><h2 id="capabilities-heading" className="mt-3 text-3xl font-semibold tracking-normal text-ink">Built around the details an inspector needs to verify.</h2></div><div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">{capabilities.map(([title, description], index) => <article className="welcome-capability flex gap-3 border-t border-border pt-4 transition-colors hover:border-brand/35" key={title} style={{ animationDelay: `${index * 50}ms` }}><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-light text-xs font-semibold text-brand" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><div><h3 className="font-semibold text-ink">{title}</h3><p className="mt-1 text-sm leading-5 text-muted">{description}</p></div></article>)}</div></div></Reveal></section>
      <section className="border-y border-border bg-[#f1f5f9] shadow-[inset_0_1px_0_rgb(255_255_255_/_0.65)]" aria-labelledby="surfaces-heading"><div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-16"><Reveal><div className="max-w-2xl"><p className="text-xs font-semibold uppercase text-brand">Inside the inspection</p><h2 id="surfaces-heading" className="mt-3 text-3xl font-semibold tracking-normal text-ink">Every output stays tied to the product record.</h2></div></Reveal><div className="mt-9 grid gap-5 lg:grid-cols-3"><Reveal delay={40}><div className="mb-3 flex items-center justify-between"><p className="text-[10px] font-semibold uppercase text-muted">01 / Automated result</p><span className="text-xs text-brand">Score</span></div><MiniResult /></Reveal><Reveal delay={100} className="lg:mt-8"><div className="mb-3 flex items-center justify-between"><p className="text-[10px] font-semibold uppercase text-muted">02 / Evidence workspace</p><span className="text-xs text-brand">Evidence</span></div><MiniEvidence /></Reveal><Reveal delay={160} className="lg:mt-16"><div className="mb-3 flex items-center justify-between"><p className="text-[10px] font-semibold uppercase text-muted">03 / Inspection record</p><span className="text-xs text-brand">Report</span></div><MiniReport /></Reveal></div></div></section>
      <section className="bg-navy text-white" aria-labelledby="final-cta-heading"><div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 py-14 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:py-16"><div><h2 id="final-cta-heading" className="text-3xl font-semibold tracking-normal">Ready to begin an inspection?</h2><p className="mt-2 max-w-xl text-sm leading-6 text-white/70">Start with a clear product label and move from intake to automated outcome, evidence, and reporting.</p></div><div className="flex flex-col gap-3 sm:flex-row"><Link to="/dashboard" className={lightAction}>Get started <span aria-hidden="true">-&gt;</span></Link><Link to="/signin" className={outlineAction}>Sign in</Link></div></div></section>
    </main>
    <footer className="border-t border-white/10 bg-navy px-5 py-6 text-xs text-white/45 sm:px-8 lg:px-10"><div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2"><BrandMark /><span>Packet Decoder</span></div><span>Packaged-commodity compliance inspection workflow.</span></div></footer>
  </div>
}
