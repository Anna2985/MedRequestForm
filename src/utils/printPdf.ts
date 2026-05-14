import { logApiCall } from './apiLogger';
import type { Order } from '../types';

interface MedCloudItem {
  CODE: string;
  NAME: string;
  DIANAME: string;
  DRUGKIND: string;
  MIN_PAKAGE: string;
  BRD: string;
  SUPPLIER_LICENSE: string;
}

async function fetchMedCloud(): Promise<MedCloudItem[]> {
  try {
    const data = await logApiCall('/api/med_page/get_med_cloud', 'POST', {});
    return data.Data || [];
  } catch {
    return [];
  }
}

function findMedInfo(medList: MedCloudItem[], code: string): MedCloudItem | undefined {
  return medList.find(m => m.CODE === code);
}

function esc(str: string | number | undefined | null): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildPage(
  group: { code: string; name: string; orders: Order[] },
  med: MedCloudItem | undefined,
  isLast: boolean
): string {
  // Each data row has 3 sub-rows for patient info block
  const rows = group.orders.map(o => {
    const sd = o.SD ?? '';
    const unit = o.DUNIT ? ` ${esc(o.DUNIT)}` : '';
    return `
    <tr>
      <td rowspan="3" class="date-cell">${esc(o.CT_TIME)}</td>
      <td class="pat-top">床號：${esc(o.BEDNO)}</td>
      <td rowspan="3" class="center-cell"></td>
      <td rowspan="3" class="red center-cell">${esc(sd)}${unit}</td>
      <td rowspan="3" class="red center-cell"></td>
      <td rowspan="3" class="center-cell"></td>
      <td rowspan="3" class="center-cell"></td>
      <td rowspan="3" class="center-cell"></td>
      <td rowspan="3" class="center-cell"></td>
      <td rowspan="3" class="center-cell"></td>
      <td rowspan="3" class="center-cell"></td>
    </tr>
    <tr>
      <td class="pat-mid">${esc(o.PATNAME)}、${esc(o.PATCODE)}</td>
    </tr>
    <tr>
      <td class="pat-bot"></td>
    </tr>`;
  }).join('');

  const pageBreak = isLast ? '' : 'page-break-after:always;';

  return `
<div class="page" style="${pageBreak}">
  <div class="page-header">
    <h1>臺北民總醫院玉里分院管制藥品使用量及殘餘量銷毀記錄表</h1>
    <span class="revised">109 年 7 月修改</span>
  </div>

  <!-- 上方藥品資訊區塊 (10欄) -->
  <!--
    圖片第1行: 藥品名稱 | 注射Morphine HCl injection | 管制藥品成分及含量 | Morphine 10mg/ml | 藥品許可證字號 | 衛署藥製字第 005891 號
    圖片第2行: 管制級別 | 一 | 製造廠名稱 | 管制藥品管理局 | 最 小 單 位 | 支 | 批號 | (空)
    圖片第3行: [日 期]紅 | [發藥藥師]紅 | [實收空瓶數]紅 | [實發藥品數量]紅 | [護理站結存(數量及日期)]紅 | [護理站]紅 | [領藥人簽名]紅
    圖片第4行: 空白資料行
  -->
  <table class="drug-info">
    <colgroup>
      <col style="width:6%">
      <col style="width:13%">
      <col style="width:9%">
      <col style="width:12%">
      <col style="width:9%">
      <col style="width:12%">
      <col style="width:8%">
      <col style="width:4%">
      <col style="width:7%">
      <col>
    </colgroup>
    <!-- 行1: 藥品名稱 | 藥名值 | 管制藥品成分及含量 | 含量值 | 藥品許可證字號 | 許可證號值 -->
    <tr>
      <th>藥品名稱</th>
      <td colspan="3">${esc(med?.NAME ?? group.name)}</td>
      <th>管制藥品成分及含量</th>
      <td colspan="2">${esc(med?.DIANAME ?? '')}</td>
      <th colspan="2">藥品許可證字號</th>
      <td>${esc(med?.SUPPLIER_LICENSE ?? '')}</td>
    </tr>
    <!-- 行2: 管制級別 | 值 | 製造廠名稱 | 值 | 管制藥品管理局 最小單位 | 支 | 批號 | 值 -->
    <tr>
      <th>管制級別</th>
      <td>${esc(med?.DRUGKIND ?? '')}</td>
      <th>製造廠名稱</th>
      <td>${esc(med?.BRD ?? '')}</td>
      <th style="font-size:8pt">管制藥品管理局<br><span style="letter-spacing:3px">最小單位</span></th>
      <td style="text-align:center">支</td>
      <th colspan="2">批號</th>
      <td colspan="2"></td>
    </tr>
    <!-- 最 小 單 位 在第2行的管制藥品管理局欄位下方顯示為子標題 (用絕對定位或巢狀) -->
    <!-- 行3: 紅字標題 -->
    <tr class="red-header-row">
      <th class="red">日&ensp;期</th>
      <th class="red">發藥藥師</th>
      <th class="red">實收空瓶數</th>
      <th class="red">實發藥品數量</th>
      <th class="red" colspan="2">護理站結存(數量及日期)</th>
      <th class="red" colspan="2">護理站</th>
      <th class="red" colspan="2">領藥人簽名</th>
    </tr>
    <!-- 行4: 空白 -->
    <tr>
      <td></td><td></td><td></td><td></td>
      <td colspan="2"></td>
      <td colspan="2"></td>
      <td colspan="2"></td>
    </tr>
  </table>

  <!-- 明細記錄表 -->
  <table class="record-table">
    <colgroup>
      <col style="width:9%">
      <col style="width:15%">
      <col style="width:11%">
      <col style="width:7%">
      <col style="width:7%">
      <col style="width:8%">
      <col style="width:9%">
      <col style="width:9%">
      <col style="width:9%">
      <col style="width:9%">
      <col style="width:7%">
    </colgroup>
    <thead>
      <tr>
        <th>日期</th>
        <th>
          病患資料<br>
          <span class="sub">(床號、姓名、病歷<br>號、身分證字號)</span>
        </th>
        <th>處方醫師<br>麻管證號</th>
        <th class="red">使用量<br>(支)</th>
        <th class="red">殘餘量<br>(支)</th>
        <th>結存量<br>(支)</th>
        <th>施打者</th>
        <th>銷毀人</th>
        <th>見證人</th>
        <th>核對藥師</th>
        <th>交班<br>簽名</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
</div>`;
}

export async function printOrdersPdf(
  drugGroups: { code: string; name: string; orders: Order[] }[],
): Promise<void> {
  const medList = await fetchMedCloud();

  const pages = drugGroups
    .map((g, i) => buildPage(g, findMedInfo(medList, g.code), i === drugGroups.length - 1))
    .join('');

  const html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<title>管制藥品使用量及殘餘量銷毀記錄表</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: "DFKai-SB", "標楷體", "BiauKai", "KaiTi", serif;
    font-size: 9.5pt;
    color: #000;
  }

  .page {
    padding: 10mm 12mm 8mm;
    position: relative;
  }

  /* 頁首 */
  .page-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 5px;
  }
  .page-header h1 {
    font-size: 13pt;
    font-weight: bold;
    letter-spacing: 1px;
    text-align: center;
    flex: 1;
  }
  .revised {
    font-size: 9pt;
    white-space: nowrap;
    margin-left: 8px;
  }

  /* 藥品資訊表 */
  .drug-info {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 0;
    font-size: 9pt;
    border: 1px solid #000;
  }
  .drug-info th,
  .drug-info td {
    border: 1px solid #000;
    padding: 2px 4px;
    vertical-align: middle;
    line-height: 1.4;
  }
  .drug-info th {
    background: #f0f0f0;
    font-weight: bold;
    text-align: center;
    white-space: nowrap;
  }
  .red-header-row th {
    color: #000;
    background: #fff;
    height: 24px;
  }
  .drug-info tr:last-child td {
    height: 24px;
  }

  /* 許可證字號橫條 (疊加在藥品資訊表右側) */
  .license-row {
    border: 1px solid #000;
    border-top: none;
    padding: 2px 4px;
    font-size: 9pt;
    display: flex;
    gap: 8px;
    margin-bottom: 4px;
  }
  .license-row .label {
    font-weight: bold;
    white-space: nowrap;
  }

  /* 明細記錄表 */
  .record-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9pt;
  }
  .record-table th,
  .record-table td {
    border: 1px solid #000;
    padding: 2px 3px;
    text-align: center;
    vertical-align: middle;
    line-height: 1.3;
  }
  .record-table thead th {
    background: #f0f0f0;
    font-weight: bold;
  }
  .record-table .sub {
    font-size: 7.5pt;
    font-weight: normal;
  }

  /* Data rows: each order spans 3 sub-rows */
  .date-cell {
    vertical-align: middle;
    white-space: nowrap;
    font-size: 8.5pt;
  }
  .pat-top, .pat-mid, .pat-bot {
    text-align: left;
    padding-left: 4px;
    height: 16px;
    font-size: 8.5pt;
  }
  .center-cell { text-align: center; }
  .red { color: #000; }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @page { size: A4 landscape; margin: 8mm; }
  }
</style>
</head>
<body>
${pages}
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:0;';
  document.body.appendChild(iframe);

  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } finally {
      setTimeout(() => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(url);
      }, 2000);
    }
  };

  iframe.src = url;
}