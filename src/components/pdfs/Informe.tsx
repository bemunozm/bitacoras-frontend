import { getPeriod } from '@/helpers';
import './Informe.css';
import html2pdf from 'html2pdf.js';
import { useEffect } from 'react';

const options = {
  filename: 'my-document.pdf',
  margin: 0,
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 4, useCORS: true }, // Agregar useCORS: true
  jsPDF: { unit: 'px', format: [595, 842], orientation: 'portrait' },
};

const Informe = ({ bitacora } : any) => {

  
  const getWeekFromDate = (date: string) => {
    const d = new Date(date);
    const start = new Date(d.getFullYear(), 0, 1);
    const diff = (d.getTime() - start.getTime()) + ((start.getTimezoneOffset() - d.getTimezoneOffset()) * 60 * 1000);
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    const week = Math.floor(diff / oneWeek);
    return `Semana ${week + 1}`;
  };
  
  const groupActivitiesByWeekAndCategory = (activities: any[]) => {
    const grouped: any = {};
  
    activities.forEach((activity) => {
      const week = getWeekFromDate(activity.date);
      const category = activity.categories.name;
  
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
        <div className="informe-header-container">
          <div className="informe-title">Informe Mensual de Gestión</div>
          <table className="informe-table">
            <tbody>
              <tr>
                <td className="informe-header">Responsable</td>
                <td className="informe-data">{bitacora?.users.name}</td>
                <td className="informe-header">Cargo</td>
                <td className="informe-data">{bitacora?.users.job_position}</td>
              </tr>
              <tr>
                <td className="informe-header">Dispositivo</td>
                <td className="informe-data">{bitacora?.programs.name}</td>
                <td className="informe-header">Región</td>
                <td className="informe-data">{bitacora?.programs.state}</td>
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
      </div>
    </div>
  );
};



export default Informe;
