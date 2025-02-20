import { getPeriod } from '@/helpers';
import './Informe.css';
import html2pdf from 'html2pdf.js';
import { useEffect } from 'react';



/**
 * Componente que genera un informe mensual en PDF agrupando las actividades por semana
 * @param bitacora - Objeto con la información de la bitácora
 */
const Informe = ({ bitacora } : any) => {
  // Configuración para la generación del PDF
const options = {
  filename: `Informe ${bitacora.user.name} - ${getPeriod(bitacora.month)}.pdf`,
  margin: 0,
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 4, useCORS: true }, // Agregar useCORS: true
  jsPDF: { unit: 'px', format: [595, 842], orientation: 'portrait' },
};
  // Calcula el número de semana del mes para una fecha dada
  const getWeekFromDate = (date: string) => {
    const d = new Date(date);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const diff = (d.getTime() - start.getTime()) + ((start.getTimezoneOffset() - d.getTimezoneOffset()) * 60 * 1000);
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    const week = Math.floor(diff / oneWeek);
    return `Semana ${week + 1}`;
  };
  
  // Agrupa las actividades por semana y categoría, excluyendo las actividades generales
  const groupActivitiesByWeekAndCategory = (activities: any[]) => {
    const grouped: any = {};

    activities
      .filter(activity => activity.category.name !== 'Actividades Generales')
      .forEach((activity) => {
        const week = getWeekFromDate(activity.date);
        const category = activity.category.name;

        if (!grouped[week]) {
          grouped[week] = {};
        }

        if (!grouped[week][category]) {
          grouped[week][category] = []; 
        }

        grouped[week][category].push(activity);
      });

    return grouped;
  };

  const groupedActivities = groupActivitiesByWeekAndCategory(bitacora.activities);

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
      html2pdf().from(element).set(options).save();
    });
  }, [bitacora]);

  console.log('Desde informe',bitacora.activities)

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
                <td className="informe-header">Cargo</td>
                <td className="informe-data">{bitacora?.user.job_position}</td>
              </tr>
              <tr>
                <td className="informe-header">Dispositivo</td>
                <td className="informe-data">{bitacora?.program.name}</td>
                <td className="informe-header">Turno</td>
                <td className="informe-data">{bitacora?.shift || 'No especificado'}</td>
              </tr>
              <tr>
                <td className="informe-header">Periodo Informado</td>
                <td className="informe-data">{bitacora?.month ? getPeriod(bitacora?.month) : ''}</td>
                <td className="informe-header">Número de boleta</td>
                <td className="informe-data">{bitacora?.recipe}</td>
              </tr>
              <tr>
                <td className="informe-header">Fecha de emisión</td>
                <td className="informe-data">{new Date().toLocaleDateString()}</td>
                <td className="informe-header">Región</td>
                <td className="informe-data">{bitacora?.program.state}</td>
              </tr>
            </tbody>
          </table>
          <img className="informe-logo-ministerio" src="/logo-ministerio.png" />
          <img className="informe-logo-fundacion" src="/logo-fundacion.png" />
        </div>

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

        {/* Sección principal de actividades agrupadas por semana */}
        <div className="informe-actividades-container">
          {Object.keys(groupedActivities).sort().map((week) => (
            <div key={week}>
              <div className="informe-actividades-sub-title uppercase">Actividades {week} - {getPeriod(bitacora.created_at)}:</div>
              <ul className="informe-actividades-list">
                {Object.keys(groupedActivities[week]).map((category) => (
                  <li key={category}>
                    {category}:
                    <ul className="informe-actividades-sublist">
                      {groupedActivities[week][category].map((activity: any) => (
                        <li key={activity.id}>{activity.description}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Sección de anexos con imágenes */}
        <div className="informe-anexos">
          {/* Agregar título de anexos */}
          <div className="informe-anexos-title">Anexos</div>
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

        {/* Sección de firmas */}
        <div className="signature-container">
          <div className="signature-space">
            <hr className="signature-line" />
            <div className="signature-name">Firma Coordinador General</div>
            <div className="signature-name">Mario Cortés Castillo</div>
          </div>
          <div className="signature-space">
            <hr className="signature-line" />
            <div className="signature-name">{`Firma ${bitacora.user.job_position}`}</div>
            <div className="signature-name">{bitacora.user.name}</div>
          </div>
        </div>
      </div>
      
      {/* Pie de página con numeración */}
      <div className="footer">
        Página <span className="pageNumber"></span> de <span className="totalPages"></span>
      </div>
    </div>
  );
};

export default Informe;
