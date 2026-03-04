import React, { useContext, useEffect, useState } from 'react'
import CartContext from '../../Context/CartContext';
import axios from "axios"

export default function Vto() {

  const [humanPreview, setHumanPreview] = useState(null);   // preview URL for display
  const [humanFile, setHumanFile] = useState(null);          // actual File object for upload
  const { ImageVto } = useContext(CartContext);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Store both preview URL and the actual File object for the person image
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setHumanPreview(imageUrl);
      setHumanFile(file);
      setError(null);
    }
  };

  const handleTryOn = async () => {
    // Validation
    if (!humanFile) {
      setError("Please upload your photo first.");
      return;
    }
    if (!ImageVto || ImageVto.length === 0 || !ImageVto[0]?.img) {
      setError("No cloth image selected. Please select a product first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // 1) Fetch the cloth image URL and convert to a File for upload
      const clothImageUrl = ImageVto[0].img;
      const clothResponse = await fetch(clothImageUrl);
      const clothBlob = await clothResponse.blob();
      const clothFile = new File([clothBlob], "cloth.jpg", {
        type: clothBlob.type || "image/jpeg",
      });

      // 2) Build FormData with field names matching backend multer config
      const formData = new FormData();
      formData.append('person', humanFile);
      formData.append('cloth', clothFile);

      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // const NGROK_URL = "https://unnutritive-nonsyndicated-sheena.ngrok-free.dev"; // your Colab Ngrok URL

      // 3) POST FormData to backend (returns binary PNG image)
     const response = await axios.post(
  `http://localhost:3000/viton`,
  formData,
  { headers, timeout: 300000, responseType: 'blob' } // keeps it as binary image
);

      console.log("Try-on API response received",response.data);

      // 4) Convert the binary image response to a displayable URL
      const imageBlob = new Blob([response.data], { type: 'image/png' });
      const imageUrl = URL.createObjectURL(imageBlob);
      setResult(imageUrl);
    } catch (err) {
      console.error('Try-on error:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Virtual try-on failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ImageVto && ImageVto.length > 0) {
      console.log('Cloth image URL:', ImageVto[0].imageUrl);
    }
  }, [ImageVto]);

  return (<>
    <div className="bg-gray-100 min-h-screen flex items-center justify-center gap-15">

      {/* ── Person Image Upload ────────────────────────────────── */}
      <div className='relative bg-white h-70 w-70 rounded-3xl border-dashed
    flex items-center justify-center overflow-hidden cursor-pointer'>
        <label htmlFor='input-field' className="w-full h-full flex items-center justify-center cursor-pointer">
          <input type="file" accept='image/*' id='input-field' onChange={handleFileChange} className="bg-gray-500 hidden" />
          {humanPreview ? (
            <img src={humanPreview} alt="Your Photo" className="max-h-full object-contain" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="text-6xl mb-4">📷</div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                Click to upload your photo
              </p>
              <span className="text-sm text-gray-500 mb-3">
                PNG, JPG up to 10MB
              </span>
              <span className="text-xs text-gray-400 max-w-xs">
                💡 Use a clear, front-facing photo for best results
              </span>
            </div>
          )}
        </label>
      </div>
      <div className='font-bold text-2xl' >+</div>

      {/* ── Cloth Image (from selected product) ───────────────── */}
      <div className='relative bg-white h-70 w-70 rounded-3xl border-dashed border-black border-2 flex items-center justify-center'>
        {ImageVto && ImageVto.length > 0 ? (
          <img
            src={ImageVto[0].img || ImageVto[0].imageUrl || ImageVto[0].image}
            alt={ImageVto[0].name || "Selected Cloth"}
            className="max-h-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4">
            <div className="text-5xl mb-3">👕</div>
            <p className="text-sm text-gray-500">No cloth selected</p>
          </div>
        )}
      </div>

      {/* ── Try On Button ─────────────────────────────────────── */}
      <button
        onClick={handleTryOn}
        disabled={loading}
        className={`font-bold w-50 h-10 text-white rounded
          ${loading
            ? 'bg-gray-400 cursor-wait'
            : 'bg-amber-950 hover:bg-red-600 active:text-amber-50'}`}
      >
        {loading ? 'Processing...' : 'Try On'}
      </button>

      <div className='font-bold text-2xl' >=</div>

      {/* ── Result Image ──────────────────────────────────────── */}
      <div className='bg-white h-70 w-70 rounded-3xl border-dashed border-black border-2 flex items-center justify-center'>
        {loading ? (
          <div className="flex flex-col items-center text-center p-4">
            <div className="text-4xl animate-spin mb-3">⏳</div>
            <p className="text-sm text-gray-500">Generating try-on result...</p>
          </div>
        ) : result ? (
          <img src={result} alt="VTO Result" className="max-h-full object-contain" />
        ) : (
          <div className="flex flex-col items-center text-center p-4">
            <div className="text-5xl mb-3 animate-pulse">✨</div>
            <p className="text-sm text-gray-500">Result will appear here</p>
          </div>
        )}
      </div>

    </div>

    {/* ── Error Message ──────────────────────────────────── */}
    {error && (
      <div className="max-w-2xl mx-auto mt-4 bg-red-50 border border-red-200 rounded-xl p-4 shadow-md text-red-700 text-sm">
        ⚠️ {error}
      </div>
    )}

    {/* ── Tips Section ───────────────────────────────────── */}
    <div className="max-w-2xl bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-md">
      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span>📌</span> Tips for Best Results:
      </h4>
      <ul className="space-y-2">
        <li className="flex items-start gap-3 text-gray-700">
          <span className="text-blue-600 mt-0.5">•</span>
          <span>Use a clear, well-lit photo</span>
        </li>
        <li className="flex items-start gap-3 text-gray-700">
          <span className="text-blue-600 mt-0.5">•</span>
          <span>Stand straight and face the camera</span>
        </li>
        <li className="flex items-start gap-3 text-gray-700">
          <span className="text-blue-600 mt-0.5">•</span>
          <span>Wear fitted clothing for accurate results</span>
        </li>
        <li className="flex items-start gap-3 text-gray-700">
          <span className="text-blue-600 mt-0.5">•</span>
          <span>Ensure your full upper body is visible</span>
        </li>
      </ul>
    </div>
  </>
  )
}