import { renderReportHtml } from "@/lib/documents/report"
import { getReportData } from "../_data"

/**
 * GET /reports/print
 * Org-scoped printable operational report. Returns a self-contained HTML
 * document (inline CSS) the browser prints to PDF. Same aggregates as the
 * Reports page; all money in integer paise until the format edge.
 */
export async function GET() {
  const { orgName, rangeLabel, generatedAt, revenue, hours, totalRevenuePaise } =
    await getReportData()

  const html = renderReportHtml({
    orgName,
    generatedAt,
    rangeLabel,
    totalRevenuePaise,
    revenue,
    hours,
  })

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  })
}
