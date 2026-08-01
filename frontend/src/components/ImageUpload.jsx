import { useState } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const ImageUpload = ({ onImageUploadMock }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Create local URL for preview
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) return;
    setIsProcessing(true);
    
    // Simulate Vision API mock upload
    setTimeout(() => {
      onImageUploadMock(selectedImage, "spilled food"); 
      setSelectedImage(null);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="flex items-center gap-2">
      {!selectedImage ? (
        <label className="cursor-pointer text-gray-500 hover:text-blue-500">
          <PhotoIcon className="h-6 w-6" />
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
        </label>
      ) : (
        <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg border border-gray-300">
          <img src={selectedImage} alt="preview" className="h-10 w-10 object-cover rounded" />
          <button onClick={() => setSelectedImage(null)} className="text-gray-500 hover:text-red-500">
            <XMarkIcon className="h-5 w-5" />
          </button>
          <button 
            onClick={handleUpload} 
            disabled={isProcessing}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isProcessing ? 'Processing AI Vision...' : 'Send Image'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
