import { getPeriod, formatDate } from '@/helpers';
import './Informe.css';
import html2pdf from 'html2pdf.js';
import { useEffect } from 'react';



/**
 * Componente que genera un informe mensual en PDF agrupando las actividades por día
 * Similar a Informe.tsx pero con diferente agrupación temporal
 * @param bitacora - Objeto con la información de la bitácora
 */
const InformePerDay = ({ bitacora } : any) => {

  // Configuración para la generación del PDF
const options = {
  filename: `Informe ${bitacora.user.name} - ${getPeriod(bitacora.month)}.pdf`,
  margin: 0,
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 4, useCORS: true },
  jsPDF: { unit: 'px', format: [595, 842], orientation: 'portrait' },
};

  const turn = bitacora.program.users ? bitacora.program.users.find((user: any) => user.user_id == bitacora.user_id)?.turn : 'No especificado';

  // Calcula la fecha de emisión (último día del mes del periodo informado)
  const emisionDate = new Date(bitacora.month);
  emisionDate.setMonth(emisionDate.getMonth() + 1);
  emisionDate.setDate(0); // Esto establece la fecha al último día del mes anterior


  // Agrupa las actividades por día y categoría, excluyendo las actividades generales
  const groupActivitiesByDayAndCategory = (activities: any[]) => {
    const grouped: any = {};
  
    activities
      .filter(activity => activity.category.name !== 'Actividades Generales')
      .forEach((activity) => {
        // Usa formatDate para normalizar las fechas
        const day = formatDate(activity.date);
        const category = activity.category.name;
    
        if (!grouped[day]) {
          grouped[day] = {};
        }
    
        if (!grouped[day][category]) {
          grouped[day][category] = []; 
        }
    
        grouped[day][category].push(activity);
      });
  
    return grouped;
  };

  const groupedActivities = groupActivitiesByDayAndCategory(bitacora.activities);

  // Efecto para manejar la generación del PDF una vez que todas las imágenes están cargadas
  useEffect(() => {
    const element = document.getElementById('informe');
    const images = element?.getElementsByTagName('img');
    const loadPromises = [];

    if (images) {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (!img.complete) {
          loadPromises.push(new Promise((resolve) => {
            img.onload = img.onerror = resolve;
          }));
        }
      }
    }

    Promise.all(loadPromises).then(() => {
      html2pdf()
        .from(element)
        .set(options)
        .toPdf()
        .get('pdf')
        .then((pdf: any) => {
          const totalPages = pdf.internal.getNumberOfPages();
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();

          for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            
            // Configuración del texto
            pdf.setFontSize(10);
            pdf.setTextColor(100);

            // Función helper para centrar texto
            const centerText = (text: string, y: number) => {
              const textWidth = pdf.getStringUnitWidth(text) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
              const x = (pageWidth - textWidth) / 2;
              pdf.text(text, x, y);
            };

            // Footer con línea separadora
            const footerY = pageHeight - 50; // Posición base del footer
            
            // // Dibuja línea horizontal centrada
            // const lineWidth = 400; // Ancho de la línea aumentado a 400px
            // pdf.setDrawColor(100); // Mismo color que el texto (100)
            // pdf.setLineWidth(0.5);
            // pdf.line(
            //   (pageWidth - lineWidth) / 2,
            //   footerY,
            //   (pageWidth + lineWidth) / 2,
            //   footerY
            // );

            // Textos del footer
            const headerText = `${bitacora.user.name} - ${getPeriod(bitacora.month)}`;
            const footerText = `Página ${i} de ${totalPages}`;

            // Centrar y posicionar textos
            centerText(headerText, footerY + 15);
            centerText(footerText, footerY + 30);
          }
        })
        .save();
    });
  }, [bitacora]);

  return (
    <div className="full-width-container">
      <div id="informe" className="informe-container">
        {/* Cabecera del informe con información general */}
        <div className="informe-header-container">
          <div className="informe-title">Informe Mensual de Gestión</div>
          <table className="informe-table">
            <tbody>
              <tr>
                <td className="informe-header">Responsable</td>
                <td className="informe-data">{bitacora?.user.name}</td>
                <td className="informe-header">Programa</td>
                <td className="informe-data">{bitacora?.program.name}</td>
              </tr>
              <tr>
                <td className="informe-header">Cargo</td>
                <td className="informe-data">{bitacora.user.is_replacement ? 'Remplazo' : bitacora.user.job_position || 'Sin información'}</td>
                <td className="informe-header">Turno</td>
                <td className="informe-data">{turn}</td>
              </tr>
              <tr>
                <td className="informe-header">Periodo Informado</td>
                <td className="informe-data">{bitacora?.month ? getPeriod(bitacora?.month) : ''}</td>
                <td className="informe-header">Número de boleta</td>
                <td className="informe-data">{bitacora?.recipe}</td>
              </tr>
              <tr>
                <td className="informe-header">Fecha de emisión</td>
                <td className="informe-data">{emisionDate.toLocaleDateString()}</td>
                <td className="informe-header">Región</td>
                <td className="informe-data">{bitacora?.program.state}</td>
              </tr>
            </tbody>
          </table>
          <img className="informe-logo-ministerio" src="/logo-ministerio.png" />
          <img className="informe-logo-fundacion" src="/logo-fundacion.png" />
        </div>

        <div className="informe-content">
          {/* Sección de actividades generales si existen */}
          {bitacora.activities.some((activity: any) => activity.category.name === 'Actividades Generales') && (
            <div className="actividades-generales-container">
              <div className="actividades-generales-title">Actividades Generales</div>
              <ul className="actividades-generales-list">
                {bitacora.activities
                  .filter((activity: any) => activity.category.name === 'Actividades Generales')
                  .map((activity: any) => (
                    <li key={activity.id}>{activity.description}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="informe-actividades-container">
            {Object.keys(groupedActivities).sort().map((day) => (
              <div key={day}>
                <div className="informe-actividades-sub-title uppercase">Actividades {day}:</div>
                <ul className="informe-actividades-list">
                  {Object.keys(groupedActivities[day]).map((category) => (
                    <li key={category}>
                      {category}:
                      <ul className="informe-actividades-sublist">
                        {groupedActivities[day][category].map((activity: any) => (
                          <li key={activity.id}>{activity.description}</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {/* Sección de anexos modificada */}
          {bitacora?.activities.some((activity: any) => activity.attachments?.length > 0) && (
            <div className="informe-anexos">
              <div className="informe-anexos-title">Anexos (Respaldo Fotográfico)</div>
              {bitacora?.activities.map((activity: any) => {
                if (!activity.attachments || activity.attachments.length === 0) return null;

                // Dividir los anexos en grupos de 4 imágenes
                const attachmentGroups = [];
                for (let i = 0; i < activity.attachments.length; i += 4) {
                  attachmentGroups.push(activity.attachments.slice(i, i + 4));
                }

                return attachmentGroups.map((group, groupIndex) => (
                  <div key={`${activity.id}-${groupIndex}`} className={`informe-anexo-actividad ${groupIndex > 0 ? 'page-break' : ''}`}>
                    {groupIndex === 0 && (
                      <div className="informe-anexo-actividad-title">
                        <ul className="informe-anexo-actividad-list">
                          <li>{activity.description}</li>
                        </ul>
                      </div>
                    )}
                    <div className="informe-anexo-imagenes">
                      {group.map((attachment: any) => (
                        <img 
                          key={attachment.id} 
                          src={attachment.image} 
                          alt={`Anexo ${attachment.id + 1}`} 
                          className="informe-anexo-imagen"
                        />
                      ))}
                    </div>
                  </div>
                ));
              })}
            </div>
          )}

          <div className="signature-container">
            <div className="signature-space">
              <hr className="signature-line" />
              <div className="signature-name">Firma Coordinador General</div>
              <div className="signature-name">Mario Cortés Castillo</div>
            </div>
            <div className="signature-space">
              <hr className="signature-line" />
              <div className="signature-name">{`Firma ${bitacora.user.is_replacement ? 'Remplazo' : bitacora.user.job_position || 'Sin información'}`}</div>
              <div className="signature-name">{bitacora.user.name}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformePerDay;
