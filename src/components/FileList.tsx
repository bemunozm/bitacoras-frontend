import { FileWithPreview } from '@/components/DropZone';
import { X } from 'lucide-react';
import type { Attachment } from '@/types';

type FileListProps = {
    files: FileWithPreview[];
    existingFiles: Attachment[]; // Añadir archivos existentes
    onRemove: (file: FileWithPreview | Attachment) => void; // Permitir eliminar ambos tipos de archivos
}

export default function FileList({ files, existingFiles, onRemove }: FileListProps) {
    // Filtrar archivos duplicados
    const uniqueFiles = files.filter(file => !existingFiles.some(existingFile => existingFile.image === file.preview));

    return (
        <ul className="mt-4 space-y-2">
          {existingFiles.map((file) => (
            <li key={file.id} className="flex items-center space-x-2 p-2 border border-sidebar-border rounded-md">
              {file.image ? (
                <img src={file.image} alt="Preview" className="w-10 h-10 object-cover rounded" />
              ) : (
                <div className="w-10 h-10 bg-gray-300 flex items-center justify-center rounded">
                  <span className="text-xs text-sidebar-foreground dark:text-white">{file.image.split('.').pop()}</span>
                </div>
              )}
              <span className="flex-1 truncate text-sidebar-foreground">{file.image.split('/').pop()}</span>
              <button onClick={() => onRemove(file)} className="text-red-500 hover:text-red-700">
                <X size={16} />
              </button>
            </li>
          ))}
          {uniqueFiles.map((file) => (
            <li key={file.id || file.name} className="flex items-center space-x-2 p-2 border border-sidebar-border rounded-md">
              {file.preview ? (
                <img src={file.preview} alt="Preview" className="w-10 h-10 object-cover rounded" />
              ) : (
                <div className="w-10 h-10 bg-gray-300 flex items-center justify-center rounded">
                  <span className="text-xs text-sidebar-foreground dark:text-white">{file.name.split('.').pop()}</span>
                </div>
              )}
              <span className="flex-1 truncate text-sidebar-foreground">{file.name || file.id}</span>
              <button onClick={() => onRemove(file)} className="text-red-500 hover:text-red-700">
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      );
}
