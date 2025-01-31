import { useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import './Acta.css';

const options = {
  filename: 'acta.pdf',
  margin: 0, // Ajuste de margen
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 2, useCORS: true }, // Reducir la escala
  jsPDF: { unit: 'pt', format: 'a4', orientation: 'landscape' }, // Usar 'pt' en lugar de 'px'
};

const Acta = ({ data, date, turn }: any) => {
  useEffect(() => {
    const element = document.getElementById('acta');
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
  }, [data]);

  // Recolectar categorías y provisiones sin repetir
  const allProvisions = data.flatMap((row: any) => row.provisions || []);

  // Reemplaza la lógica de categorías con un arreglo fijo
  const categories = ['Alimentación', 'Abrigo', 'Higiene'];
  const groupedProvisions: Record<string, Set<string>> = {
    'Alimentación': new Set(),
    'Abrigo': new Set(),
    'Higiene': new Set()
  };

  allProvisions.forEach((prov: any) => {
    if (groupedProvisions[prov.category.name]) {
      groupedProvisions[prov.category.name].add(prov.name);
    }
  });

  // Datos ficticios para pruebas
  const fakeData = Array.from({ length: 20 }, (_, index) => ({
    participant: {
      name: `Participante ${index + 1}`,
      gender: index % 2 === 0 ? 'Masculino' : 'Femenino',
      age: 20 + index,
      birthdate: new Date(2000, index % 12, index + 1).toISOString(),
      run: `12345678-${index}`,
      nationality: 'Chilena',
      diseases: index % 3 === 0 ? ['Diabetes'] : [],
    },
    provisions: [
      { category: { name: 'Alimentación' }, name: 'Desayuno AM' },
      { category: { name: 'Alimentación' }, name: 'Almuerzo PM' },
      { category: { name: 'Abrigo' }, name: 'Chaqueta' },
      { category: { name: 'Abrigo' }, name: 'Polera' },
      { category: { name: 'Abrigo' }, name: 'Calcetines' },
      { category: { name: 'Abrigo' }, name: 'Gorro' },
      { category: { name: 'Abrigo' }, name: 'Gorro 2' },
      { category: { name: 'Abrigo' }, name: 'Gorro 3' },
      { category: { name: 'Abrigo' }, name: 'Gorro 4' },
      { category: { name: 'Abrigo' }, name: 'Gorro 5' },
      { category: { name: 'Abrigo' }, name: 'Gorro 6' },
      { category: { name: 'Abrigo' }, name: 'Gorro 7' },
      { category: { name: 'Abrigo' }, name: 'Gorro 8' },
      { category: { name: 'Higiene' }, name: 'Jabón' },
    ],
  }));

  fakeData.flatMap((item: any) => item.provisions).forEach((prov: any) => {
    if (groupedProvisions[prov.category.name]) {
      groupedProvisions[prov.category.name].add(prov.name);
    }
  });

  return (
    <div className="full-width-container">
      <div id="acta" className="acta-container">
        <div className="acta-header-row">
          <div className="acta-logo-ministerio-container">
            <img className="acta-logo-ministerio" src="/logo-ministerio.png" />
          </div>
          <div className="acta-title">Acta de Entrega de Prestaciones</div>
          <div className="acta-logo-fundacion-container">
            <img className="acta-logo-fundacion" src="/logo-fundacion.png" />
          </div>
        </div>
        <div className="acta-prestaciones-row">
          <div className="acta-prestaciones-info">
            Prestaciones:
            {categories.map((cat) => (
              <div key={cat} className="acta-prestacion-item">
                <span>{cat}:</span>
                <span> {[...groupedProvisions[cat]].join(' / ')}</span>
              </div>
            ))}
          </div>
          <div className="acta-fecha-turno">
            <div className="acta-fecha-info">
              Fecha: {date}
              <br /> Turno: {turn}
            </div>
          </div>
        </div>
        <div className="acta-table-container">
          <table className="acta-data-table">
            <thead>
              <tr>
                <th>Nº</th>
                <th>Nombre</th>
                <th>Sexo</th>
                <th>Edad</th>
                <th>Fecha de Nacimiento</th>
                <th>Nº Cedula</th>
                <th>Nacionalidad</th>
                <th>E.Base</th>
                <th>Alimentación</th>
                <th>Abrigo</th>
                <th>Higiene</th>
              </tr>
            </thead>
            <tbody>
              {fakeData.map((row: any, index: number) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{row.participant.name}</td>
                  <td>{row.participant.gender}</td>
                  <td>{new Date().getFullYear() - new Date(row.participant.birthdate).getFullYear()}</td>
                  <td>{new Date(row.participant.birthdate).toLocaleDateString()}</td>
                  <td>{row.participant.run}</td>
                  <td>{row.participant.nationality}</td>
                  <td>{row.participant.diseases.length > 0 ? 'Sí' : 'No'}</td>
                  <td>{row.provisions?.some((provision: any) => provision.category.name === 'Alimentación') ? 'X' : ''}</td>
                  <td>{row.provisions?.some((provision: any) => provision.category.name === 'Abrigo') ? 'X' : ''}</td>
                  <td>{row.provisions?.some((provision: any) => provision.category.name === 'Higiene') ? 'X' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="signature-container">
          <div className="signature-space">
            <hr className="signature-line" />
            <div className="signature-name">Firma Coordinador General</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Acta;
