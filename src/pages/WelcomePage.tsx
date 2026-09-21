import { Link } from 'react-router-dom'
import heroAsset from '../assets/hero.png'
import { Reveal } from '../components/ui/Reveal'
import { ThemeToggle } from '../components/ui/ThemeToggle'

const lightAction = 'inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-semibold text-navy shadow-sm ring-1 ring-white/30 transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:bg-brand-light hover:shadow-md active:scale-[0.98] focus-visible:outline-white'
const outlineAction = 'inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/20 bg-white/[0.07] px-5 text-sm font-semibold text-white transition-[background-color,border-color,transform] duration-200 hover:-translate-y-px hover:border-white/40 hover:bg-white/[0.12] active:scale-[0.98] focus-visible:outline-white'

const workflow = [
  ['01', 'UPLOAD', 'Add product details and clear package images.'],
  ['02', 'ANALYZE', 'Run image checks, OCR, and declaration extraction.'],
  ['03', 'DETECT', 'Surface returned rule violations and evidence regions.'],
  ['04', 'SCORE', 'Generate the automated compliance outcome and score.'],
  ['05', 'REPORT', 'Create a structured inspection record and report.'],
] as const

const architecture = ['Authentication', 'Add Product / Upload', 'Image Check', 'OCR / JSON', 'Rule Evaluation', 'Automated Result', 'Evidence', 'Report / History']

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
          <p>MRP: returned field</p>
          <p>Packed on: returned field</p>
          <p>Consumer care: contact field</p>
        </div>
        <div className="mt-5 border-t border-border pt-3 text-[8px] leading-4 text-slate-400">Fictional preview content for product demonstration.</div>
        <span className="absolute left-[13%] top-[40%] h-8 w-[74%] border-2 border-warning bg-warning/10" aria-label="Illustrative declaration region" />
        <span className="absolute left-[13%] top-[57%] h-7 w-[64%] border-2 border-danger bg-danger/10" aria-label="Illustrative finding region" />
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
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-5 text-[10px] font-semibold uppercase text-white/55"><span>Packaged commodities</span><span>Product labels</span><span>Automated result</span><span>Evidence</span><span>Reports</span></div>
        </div>
      </section>
      <section className="border-b border-border bg-surface" aria-label="Product architecture"><div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-3 px-5 py-5 text-[10px] font-semibold uppercase text-muted sm:px-8 lg:px-10">{architecture.map((item, index) => <span key={item} className="inline-flex items-center gap-4"><span className={index === 0 ? 'text-navy' : ''}>{item}</span>{index < architecture.length - 1 ? <span className="text-border">/</span> : null}</span>)}</div></section>
      <section className="border-b border-border bg-surface" aria-label="What the product delivers"><div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:grid-cols-3 sm:gap-6 sm:px-8 lg:gap-10 lg:px-10 lg:py-12"><div className="border-t-2 border-brand/30 pt-4"><p className="font-mono text-xs font-semibold tracking-wide text-brand">01</p><h2 className="mt-2 text-[15px] font-semibold tracking-[-0.008em] text-ink">Automated outcome</h2><p className="mt-1 max-w-xs text-sm leading-6 text-muted">Generate an automated compliance result and score from the inspection.</p></div><div className="border-t-2 border-brand/30 pt-4"><p className="font-mono text-xs font-semibold tracking-wide text-brand">02</p><h2 className="mt-2 text-[15px] font-semibold tracking-[-0.008em] text-ink">Evidence-backed findings</h2><p className="mt-1 max-w-xs text-sm leading-6 text-muted">Connect detected findings to supporting product and label evidence.</p></div><div className="border-t-2 border-brand/30 pt-4"><p className="font-mono text-xs font-semibold tracking-wide text-brand">03</p><h2 className="mt-2 text-[15px] font-semibold tracking-[-0.008em] text-ink">Structured reports</h2><p className="mt-1 max-w-xs text-sm leading-6 text-muted">Turn the inspection outcome into a structured compliance record and report.</p></div></div></section>
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-16" aria-labelledby="workflow-heading"><Reveal><div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-xs font-semibold uppercase text-brand">One connected process</p><h2 id="workflow-heading" className="mt-3 text-3xl font-semibold tracking-normal text-ink">From label upload to compliance report.</h2></div><p className="max-w-md text-sm leading-6 text-muted">The frontend follows the backend pipeline while keeping scan, result, evidence, history, and report screens connected.</p></div><div className="relative mt-10 grid gap-6 md:grid-cols-5 md:gap-0">{workflow.map(([number, title, description], index) => <div className="welcome-step relative flex gap-3 md:block md:pr-5" key={number} style={{ animationDelay: `${index * 65}ms` }}><div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-4 border-bg bg-navy text-sm font-semibold text-white shadow-sm">{number}</div><div className="md:mt-4"><h3 className="font-semibold text-ink">{title}</h3><p className="mt-1 max-w-[12rem] text-sm leading-5 text-muted">{description}</p></div>{index < workflow.length - 1 ? <span className="absolute left-5 top-11 h-8 w-px bg-brand/25 md:left-5 md:top-[1.35rem] md:h-px md:w-[calc(100%-1rem)]" aria-hidden="true" /> : null}</div>)}</div></Reveal></section>
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-16" aria-labelledby="capabilities-heading"><Reveal><div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start"><div><p className="text-xs font-semibold uppercase text-brand">Practical coverage</p><h2 id="capabilities-heading" className="mt-3 text-3xl font-semibold tracking-normal text-ink">Built around the details an inspector needs to verify.</h2></div><div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">{capabilities.map(([title, description], index) => <article className="welcome-capability flex gap-3 border-t border-border pt-4 transition-colors hover:border-brand/35" key={title} style={{ animationDelay: `${index * 50}ms` }}><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-light text-xs font-semibold text-brand" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><div><h3 className="font-semibold text-ink">{title}</h3><p className="mt-1 text-sm leading-5 text-muted">{description}</p></div></article>)}</div></div></Reveal></section>
      <section className="border-y border-border bg-[#f1f5f9] shadow-[inset_0_1px_0_rgb(255_255_255_/_0.65)]" aria-labelledby="surfaces-heading"><div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-16"><Reveal><div className="max-w-2xl"><p className="text-xs font-semibold uppercase text-brand">Inside the inspection</p><h2 id="surfaces-heading" className="mt-3 text-3xl font-semibold tracking-normal text-ink">Every output stays tied to the product record.</h2></div></Reveal><div className="mt-9 grid gap-5 lg:grid-cols-3"><Reveal delay={40}><div className="mb-3 flex items-center justify-between"><p className="text-[10px] font-semibold uppercase text-muted">01 / Automated result</p><span className="text-xs text-brand">Score</span></div><MiniResult /></Reveal><Reveal delay={100} className="lg:mt-8"><div className="mb-3 flex items-center justify-between"><p className="text-[10px] font-semibold uppercase text-muted">02 / Evidence workspace</p><span className="text-xs text-brand">Evidence</span></div><MiniEvidence /></Reveal><Reveal delay={160} className="lg:mt-16"><div className="mb-3 flex items-center justify-between"><p className="text-[10px] font-semibold uppercase text-muted">03 / Inspection record</p><span className="text-xs text-brand">Report</span></div><MiniReport /></Reveal></div></div></section>
      <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-8 lg:px-10 lg:pb-16"><div className="rounded-lg border border-brand/15 bg-[linear-gradient(135deg,var(--color-brand-light),#ffffff)] px-6 py-7 shadow-sm sm:px-8"><p className="text-xs font-semibold uppercase text-brand">Domain focus</p><h2 className="mt-3 max-w-3xl text-2xl font-semibold tracking-normal text-ink">Built for packaged-commodity compliance inspection.</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-muted">Designed around inspection workflows for packaged commodities under the Legal Metrology (Packaged Commodities) Rules, 2011.</p></div></section>
      <section className="bg-navy text-white" aria-labelledby="final-cta-heading"><div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 py-14 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:py-16"><div><h2 id="final-cta-heading" className="text-3xl font-semibold tracking-normal">Ready to begin an inspection?</h2><p className="mt-2 max-w-xl text-sm leading-6 text-white/70">Start with a clear product label and move from intake to automated outcome, evidence, and reporting.</p></div><div className="flex flex-col gap-3 sm:flex-row"><Link to="/dashboard" className={lightAction}>Get started <span aria-hidden="true">-&gt;</span></Link><Link to="/signin" className={outlineAction}>Sign in</Link></div></div></section>
    </main>
    <footer className="border-t border-white/10 bg-navy px-5 py-6 text-xs text-white/45 sm:px-8 lg:px-10"><div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2"><BrandMark /><span>Packet Decoder</span></div><span>Packaged-commodity compliance inspection workflow.</span></div></footer>
  </div>
}
