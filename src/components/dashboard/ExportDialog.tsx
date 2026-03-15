import { useState, useRef } from 'react';
import { Download, FileText, FileSpreadsheet, FileType } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { WeekMealPlan, StoreSettings } from '@/types/meal';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportDialogProps {
  weekPlans: WeekMealPlan[];
  settings: StoreSettings;
}

export function ExportDialog({ weekPlans, settings }: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const getMealTypeName = (type: string) => {
    if (type === 'breakfast') return '아침';
    if (type === 'lunch') return '점심';
    return '저녁';
  };

  const generateCSV = () => {
    const rows: string[][] = [];
    rows.push(['주차', '요일', '날짜', '끼니', '밥', '국', '반찬1', '반찬2', '반찬3', '반찬4', '칼로리', '나트륨', '원가']);

    weekPlans.forEach((week) => {
      week.days.forEach((day) => {
        if (day.isNotOperating) {
          rows.push([
            `${week.weekNumber}주차`,
            day.dayOfWeek,
            day.date,
            '운영안함',
            '', '', '', '', '', '', '', '', ''
          ]);
        } else {
          day.meals.forEach((meal) => {
            rows.push([
              `${week.weekNumber}주차`,
              day.dayOfWeek,
              day.date,
              getMealTypeName(meal.type),
              meal.rice.name,
              meal.soup.name,
              meal.sideDishes[0]?.name || '',
              meal.sideDishes[1]?.name || '',
              meal.sideDishes[2]?.name || '',
              meal.sideDishes[3]?.name || '',
              `${meal.totalCalories}kcal`,
              `${meal.totalSodium}mg`,
              `${meal.totalCost}원`,
            ]);
          });
        }
      });
    });

    const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `식단표_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: '내보내기 완료',
      description: 'CSV 파일이 다운로드되었습니다.',
    });
    setOpen(false);
  };

  const generateText = () => {
    let content = `${settings.storeName} 식단표\n`;
    content += `생성일: ${new Date().toLocaleDateString('ko-KR')}\n`;
    content += `인원: ${settings.servingCount}명\n\n`;

    weekPlans.forEach((week) => {
      content += `═══════════════════════════════════════\n`;
      content += `${week.weekNumber}주차 (${week.startDate} ~ ${week.endDate})\n`;
      content += `═══════════════════════════════════════\n\n`;

      week.days.forEach((day) => {
        content += `▶ ${day.dayOfWeek} (${day.date})\n`;
        content += `───────────────────────────────────────\n`;
        
        if (day.isNotOperating) {
          content += `  [운영안함]\n\n`;
        } else {
          day.meals.forEach((meal) => {
            content += `  [${getMealTypeName(meal.type)}]\n`;
            content += `  밥: ${meal.rice.name}\n`;
            content += `  국: ${meal.soup.name}\n`;
            content += `  반찬: ${meal.sideDishes.map(s => s.name).join(', ')}\n`;
            content += `  열량: ${meal.totalCalories}kcal | 나트륨: ${meal.totalSodium}mg | 원가: ${meal.totalCost}원\n\n`;
          });

          if (day.snacks && day.snacks.length > 0) {
            content += `  [간식]\n`;
            day.snacks.forEach((snack) => {
              const snackItems = snack.items.map(item => `${item.name} (${item.calories}kcal)`).join(', ');
              content += `  - ${snackItems}\n`;
            });
            content += '\n';
          }
        }
      });
      content += '\n';
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `식단표_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: '내보내기 완료',
      description: '텍스트 파일이 다운로드되었습니다.',
    });
    setOpen(false);
  };

  const generatePDF = async () => {
    setGenerating(true);
    
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;

      for (let weekIndex = 0; weekIndex < weekPlans.length; weekIndex++) {
        const week = weekPlans[weekIndex];
        
        if (weekIndex > 0) {
          doc.addPage();
        }

        // Create a temporary container for HTML content - completely isolated from site CSS
        const iframe = document.createElement('iframe');
        iframe.style.cssText = `
          position: fixed; 
          left: 0; 
          top: -10000px; 
          width: 1100px; 
          height: 800px;
          border: none;
          z-index: -1000;
          opacity: 0;
          pointer-events: none;
        `;
        
        document.body.appendChild(iframe);
        
        // Wait for iframe to be ready
        await new Promise<void>(resolve => {
          if (iframe.contentDocument) {
            resolve();
          } else {
            iframe.onload = () => resolve();
          }
        });
        
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) throw new Error('Failed to create iframe document');
        
        let html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Malgun Gothic", "맑은 고딕", "Apple SD Gothic Neo", sans-serif;
                background: white;
                padding: 20px;
                color: #000;
              }
              h2 {
                text-align: center;
                margin-bottom: 15px;
                font-size: 20px;
                color: #333;
                font-weight: bold;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                font-size: 12px;
                background: white;
              }
              th {
                padding: 10px;
                border: 1px solid #ddd;
                font-weight: bold;
                background: #2d7a4f !important;
                color: white !important;
              }
              td {
                padding: 10px;
                border: 1px solid #ddd;
                background: white !important;
                color: #000 !important;
              }
              .center {
                text-align: center;
              }
              .bold {
                font-weight: bold;
              }
              .gray {
                color: #999;
                font-style: italic;
              }
              .footer {
                text-align: center;
                margin-top: 20px;
                font-size: 11px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <h2>${settings.storeName || '식단'} - ${week.weekNumber}주차 (${week.startDate} ~ ${week.endDate})</h2>
            <table>
              <thead>
                <tr>
                  <th style="width: 70px;">요일</th>
                  <th style="width: 90px;">날짜</th>
                  <th style="width: 60px;">끼니</th>
                  <th style="width: 110px;">밥</th>
                  <th style="width: 110px;">국</th>
                  <th>반찬</th>
                  <th style="width: 70px;">칼로리</th>
                  <th style="width: 80px;">원가</th>
                </tr>
              </thead>
              <tbody>
        `;

        week.days.forEach((day) => {
          if (day.isNotOperating) {
            html += `
              <tr>
                <td class="center bold">${day.dayOfWeek}</td>
                <td class="center">${day.date}</td>
                <td colspan="6" class="center gray">운영안함</td>
              </tr>
            `;
          } else {
            day.meals.forEach((meal, mealIndex) => {
              const sideDishesText = meal.sideDishes.map(s => s.name).join(', ');
              html += `
                <tr>
                  <td class="center bold">${mealIndex === 0 ? day.dayOfWeek : ''}</td>
                  <td class="center">${mealIndex === 0 ? day.date : ''}</td>
                  <td class="center">${getMealTypeName(meal.type)}</td>
                  <td>${meal.rice.name}</td>
                  <td>${meal.soup.name}</td>
                  <td>${sideDishesText}</td>
                  <td class="center">${meal.totalCalories}</td>
                  <td class="center">${meal.totalCost.toLocaleString()}원</td>
                </tr>
              `;
            });
          }
        });

        html += `
              </tbody>
            </table>
            <p class="footer">
              생성일: ${new Date().toLocaleDateString('ko-KR')} | 인원: ${settings.servingCount}명
            </p>
          </body>
          </html>
        `;

        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();

        // Wait for iframe content to be fully rendered
        await new Promise(resolve => setTimeout(resolve, 300));

        // Get the body element from iframe
        const iframeBody = iframeDoc.body;
        if (!iframeBody) throw new Error('Failed to get iframe body');

        // Convert HTML to canvas
        const canvas = await html2canvas(iframeBody, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
        });

        document.body.removeChild(iframe);

        // Add canvas to PDF
        const imgData = canvas.toDataURL('image/png', 1.0);
        const imgWidth = pageWidth - margin * 2;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // If content is too tall, scale it down to fit
        if (imgHeight > pageHeight - margin * 2) {
          const scaledHeight = pageHeight - margin * 2;
          const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
          doc.addImage(imgData, 'PNG', margin, margin, scaledWidth, scaledHeight);
        } else {
          doc.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
        }
      }

      doc.save(`식단표_${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: '내보내기 완료',
        description: 'PDF 파일이 다운로드되었습니다.',
      });
    } catch (error) {
      console.error('PDF 생성 오류:', error);
      toast({
        title: '오류 발생',
        description: `PDF 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          내보내기
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>식단 내보내기</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-14"
            onClick={generatePDF}
            disabled={generating}
          >
            <FileType className="w-5 h-5 text-red-600" />
            <div className="text-left">
              <div className="font-medium">{generating ? 'PDF 생성 중...' : 'PDF'}</div>
              <div className="text-xs text-muted-foreground">인쇄 및 공유에 적합한 형식</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-14"
            onClick={generateCSV}
            disabled={generating}
          >
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            <div className="text-left">
              <div className="font-medium">CSV (엑셀)</div>
              <div className="text-xs text-muted-foreground">엑셀에서 열 수 있는 형식</div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-14"
            onClick={generateText}
            disabled={generating}
          >
            <FileText className="w-5 h-5 text-blue-600" />
            <div className="text-left">
              <div className="font-medium">텍스트 파일</div>
              <div className="text-xs text-muted-foreground">간단한 텍스트 형식</div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
