"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface Animal {
  id: number
  name: string
  image: string
  description: string
}

const animals: Animal[] = [
  {
    id: 1,
    name: "Vaca Lechera Premium",
    image: "/landingImages/vaca.webp",
    description: "Excelencia en producción láctea",
  },
  {
    id: 2,
    name: "Oveja Merino Selecta",
    image: "/landingImages/sheep.png",
    description: "Calidad superior en lana",
  },
  {
    id: 3,
    name: "Caballo Pura Sangre",
    image: "/landingImages/horse.png",
    description: "Elegancia y rendimiento",
  },
]

export default function AnimalSlider() {
  const [currentAnimal, setCurrentAnimal] = useState<number>(0)
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false)

  useEffect(() => {
    const timer = setInterval(() => {
      handleChangeAnimal((currentAnimal + 1) % animals.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [currentAnimal])

  const handleChangeAnimal = (index: number): void => {
    if (currentAnimal === index || isTransitioning) return

    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentAnimal(index)
      setTimeout(() => setIsTransitioning(false), 50)
    }, 500)
  }

  return (
    <div className="relative w-full h-full bottom-2/4">
      {/* Animal Images - Higher z-index to be above the ribbon */}
      <div className="absolute inset-0 z-30 flex items-center justify-center">
        <div
          className={`relative w-full h-screen max-h-[90vh] transition-all duration-700 mb-16 ${
            isTransitioning ? "opacity-0 scale-105" : "opacity-100 scale-100"
          }`}
        >
          <div className="relative w-full h-full">
            <Image
              src={animals[currentAnimal].image || "/placeholder.svg"}
              alt={animals[currentAnimal].name}
              fill
              className="object-contain select-none pointer-events-none mask-gradient-b"
              sizes="100vw"
              priority
            />
          </div>
        </div>
      </div>

      {/* Ribbon - Lower z-index to be behind the images */}
      <div className="absolute inset-0 z-10">
        <div
          className={`absolute bottom-1/3 left-0 right-0 transform -skew-y-1 transition-all duration-500 ${
            isTransitioning ? "translate-y-0 opacity-0" : "translate-y-full opacity-100"
          }`}
        >
          <div className="bg-gradient-to-r from-teal-950/90 via-teal-700/80 to-teal-600/60 text-white p-4 shadow-lg">
            <div className="max-w-4xl mx-auto px-4">
              <h3 className="text-2xl md:text-3xl font-bold mb-2 -mx-12">{animals[currentAnimal].name}</h3>
              <p className="text-lg">{animals[currentAnimal].description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-3 z-40">
        {animals.map((_, index: number) => (
          <button
            key={index}
            onClick={() => handleChangeAnimal(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentAnimal === index ? "w-8 bg-white animate-pulse" : "bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Ver ${animals[index].name}`}
          />
        ))}
      </div>
    </div>
  )
}
