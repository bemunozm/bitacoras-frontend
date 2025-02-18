import { getPeriod, formatDate } from '@/helpers';
import './Informe.css';
import html2pdf from 'html2pdf.js';
import { useEffect } from 'react';

const options = {
  filename: 'my-document.pdf',
  margin: 0,
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 4, useCORS: true },
  jsPDF: { unit: 'px', format: [595, 842], orientation: 'portrait' },
};

const InformePerDay = ({ bitacora } : any) => {

  const groupActivitiesByDayAndCategory = (activities: any[]) => {
    const grouped: any = {};
  
    activities
      // Filtrar para excluir las Actividades Generales del agrupamiento por día
      .filter(activity => activity.category.name !== 'Actividades Generales')
      .forEach((activity) => {
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

  return (
    <div className="full-width-container">
      <div id="informe" className="informe-container">
        <div className="informe-header-container">
          <div className="informe-title">Informe Mensual de Gestión</div>
          <table className="informe-table">
            <tbody>
              <tr>
                <td className="informe-header">Responsable</td>
                <td className="informe-data">{bitacora?.user.name}</td>
                <td className="informe-header">Cargo</td>
                <td className="informe-data">{bitacora.user.is_replacement ? 'Remplazo' : bitacora.user.job_position || 'Sin información'}</td>
              </tr>
              <tr>
                <td className="informe-header">Dispositivo</td>
                <td className="informe-data">{bitacora?.program.name}</td>
                <td className="informe-header">Región</td>
                <td className="informe-data">{bitacora?.program.state}</td>
              </tr>
              <tr>
                <td className="informe-header">Periodo Informado</td>
                <td className="informe-data">{bitacora?.month ? getPeriod(bitacora?.month) : ''}</td>
                <td className="informe-header">Número de boleta</td>
                <td className="informe-data">{bitacora?.recipe}</td>
              </tr>
            </tbody>
          </table>
          <img className="informe-logo-ministerio" src="/logo-ministerio.png" />
          <img className="informe-logo-fundacion" src="/logo-fundacion.png" />
        </div>

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
        <div className="informe-anexos">
          <div className="informe-anexos-title">Anexos</div>
          {bitacora?.activities.map((activity: any, index: number) => (
            activity.attachments && activity.attachments.length > 0 && (
              <div key={activity.id} className={`informe-anexo-actividad ${index % 2 === 0 ? 'page-break' : ''}`}>
                <div className="informe-anexo-actividad-title">
                  <ul className="informe-anexo-actividad-list">
                    <li>{activity.description}</li>
                  </ul>
                </div>
                <div className="informe-anexo-imagenes">
                  {activity.attachments.map((attachment: any) => (
                    <img key={attachment.id} src={attachment.image} alt={`Anexo ${attachment.id + 1}`} className="informe-anexo-imagen" />
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
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
      <div className="footer">
        Página <span className="pageNumber"></span> de <span className="totalPages"></span>
      </div>
    </div>
  );
};

export default InformePerDay;
