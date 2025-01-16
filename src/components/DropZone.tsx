import { isValidFile } from "@/utils/file-utils";
import { createFilePreview } from "@/utils/file-utils";
import {Button} from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useCallback, useState } from "react";
import FileList from "@/components/FileList";
import type { Attachment } from "@/types";

export type FileWithPreview = File & {
    preview?: string;
    id?: string; // Añadir id para manejar archivos desde la base de datos
}

export type DropZoneProps = {
  onFilesAdded: (files: FileWithPreview[]) => void;
  onExistingFilesRemoved?: (files: Attachment[]) => void; // Añadir callback para eliminar archivos existentes
  maxFiles?: number;
  maxSize?: number; // en bytes
  accept?: string;
  initialFiles?: FileWithPreview[]; // Añadir initialFiles para manejar archivos desde la base de datos
  existingFiles?: Attachment[]; // Añadir archivos existentes
}

export default function DropZone ({
    onFilesAdded,
    onExistingFilesRemoved,
    maxFiles = Infinity,
    maxSize,
    accept,
    initialFiles = [], // Inicializar initialFiles
    existingFiles = [] // Inicializar archivos existentes
  }: DropZoneProps) {
  const [files, setFiles] = useState<FileWithPreview[]>(initialFiles);
  const [existingFilesState, setExistingFilesState] = useState<Attachment[]>(existingFiles); // Estado para archivos existentes
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles
      .filter(file => isValidFile(file, maxSize, accept))
      .map(createFilePreview);

    setFiles(prevFiles => {
      const updatedFiles = [...prevFiles, ...newFiles].slice(0, maxFiles);
      onFilesAdded(updatedFiles);
      return updatedFiles;
    });
  }, [maxFiles, maxSize, accept, onFilesAdded]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragActive(true);
  }, []);

  const onDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragActive(false);
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragActive(false);
    const droppedFiles = Array.from(event.dataTransfer.files);
    handleDrop(droppedFiles);
  }, [handleDrop]);

  const onFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    handleDrop(selectedFiles);
  }, [handleDrop]);

  const removeFile = useCallback((fileToRemove: FileWithPreview | Attachment) => {
    if ('preview' in fileToRemove) {
      setFiles(prevFiles => {
        const updatedFiles = prevFiles.filter(file => file !== fileToRemove);
        onFilesAdded(updatedFiles);
        return updatedFiles;
      });
    } else {
      setExistingFilesState(prevFiles => {
        const updatedFiles = prevFiles.filter(file => file.id !== fileToRemove.id);
        if (onExistingFilesRemoved) {
          onExistingFilesRemoved(updatedFiles);
        }
        return updatedFiles;
      });
    }
  }, [onFilesAdded, onExistingFilesRemoved]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
        }`}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Arrastra y suelta archivos aquí, o haz clic para seleccionar archivos
        </p>
        <input
          type="file"
          onChange={onFileInputChange}
          accept={accept}
          className="hidden"
          multiple={maxFiles > 1}
          id="files"
          name="files" // Asegúrate de que el nombre del campo sea correcto
        />
        <Button
          type="button" // Añadir type="button" para evitar el envío del formulario
          onClick={() => document.getElementById('files')?.click()}
          className="mt-4 dark:text-sidebar-accent-foreground dark:hover:bg-sidebar-hover"
          variant="outline"
        >
          Seleccionar archivos
        </Button>
      </div>
      <FileList files={files} existingFiles={existingFilesState} onRemove={removeFile} />
    </div>
  );
};

