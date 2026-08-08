/**
 * Ambient type declarations for `html2pdf.js`,
 * which does not ship its own types.
 */

declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[]
    filename?: string
    image?: { type?: string; quality?: number }
    html2canvas?: Record<string, unknown>
    jsPDF?: Record<string, unknown>
    pagebreak?: Record<string, unknown>
  }

  interface Html2Pdf {
    set(options: Html2PdfOptions): Html2Pdf
    from(element: HTMLElement | string): Html2Pdf
    save(): Promise<void>
    toPdf(): Html2Pdf
    get(type: string): unknown
    then(
      cb: (pdf: unknown) => void,
      errCb?: (err: unknown) => void,
    ): Promise<void>
  }

  function html2pdf(): Html2Pdf
  export default html2pdf
}