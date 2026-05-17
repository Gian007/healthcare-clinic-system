import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { FaTimes, FaCheck, FaMinus, FaPlus } from 'react-icons/fa'

export default function ImageCropper({ image, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const onCropChange = (crop) => {
    setCrop(crop)
  }

  const onZoomChange = (zoom) => {
    setZoom(zoom)
  }

  const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const getCroppedImg = async () => {
    try {
      const canvas = document.createElement('canvas')
      const img = new Image()
      img.src = image
      await new Promise((resolve) => {
        img.onload = resolve
      })

      const ctx = canvas.getContext('2d')
      const { x, y, width, height } = croppedAreaPixels

      canvas.width = width
      canvas.height = height

      ctx.drawImage(
        img,
        x,
        y,
        width,
        height,
        0,
        0,
        width,
        height
      )

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob)
        }, 'image/jpeg')
      })
    } catch (e) {
      console.error(e)
      return null
    }
  }

  const handleDone = async () => {
    const croppedBlob = await getCroppedImg()
    if (croppedBlob) {
      onCropComplete(croppedBlob)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-black animate-in fade-in duration-300">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 bg-slate-900 border-b border-white/10 shrink-0">
        <button onClick={onCancel} className="flex items-center gap-2 text-white/70 hover:text-white transition">
          <FaTimes />
          <span className="text-sm font-bold">Cancel</span>
        </button>
        <h2 className="text-white font-bold">Crop Profile Picture</h2>
        <button onClick={handleDone} className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition">
          <FaCheck />
          <span>Apply</span>
        </button>
      </div>

      {/* Cropper Container */}
      <div className="relative flex-1 bg-black">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={1 / 1}
          onCropChange={onCropChange}
          onCropComplete={onCropCompleteCallback}
          onZoomChange={onZoomChange}
        />
      </div>

      {/* Controls */}
      <div className="h-24 flex items-center justify-center px-6 bg-slate-900 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-4 w-full max-w-md">
          <FaMinus className="text-white/50" />
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => onZoomChange(Number(e.target.value))}
            className="flex-1 accent-primary h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
          <FaPlus className="text-white/50" />
        </div>
      </div>
    </div>
  )
}
