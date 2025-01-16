import { FileWithPreview } from '@/components/DropZone';

export const createFilePreview = (file: File): FileWithPreview => {
  return Object.assign(file, {
    preview: URL.createObjectURL(file)
  });
};

export const isValidFile = (file: File, maxSize?: number, accept?: string): boolean => {
  if (maxSize && file.size > maxSize) {
    console.error(`File ${file.name} is too large`);
    return false;
  }
  
  if (accept) {
    const acceptedTypes = accept.split(',').map(type => type.trim());
    if (!acceptedTypes.some(type => file.type.match(type))) {
      console.error(`File ${file.name} is not an accepted type`);
      return false;
    }
  }
  
  return true;
};

