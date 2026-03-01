"use client"
import Image from "next/image"

function NavBar() {
  return (
    <nav className="bg-white text-white py-2 fixed w-full top-0 left-0 z-50 border-b border-orange-400 shadow-md flex justify-center items-center gap-4 h-[80px]">
      <Image
        src="/palms.gif"  // 👈 Next.js ya sabe que debe buscar en la carpeta public
        alt="Palms"
        width={40}
        height={40}
      />
      <h1 className="text-4xl md:text-5xl font-bold font-navbar drop-shadow-sm text-orange-400">
        Quincho Doña Leonarda
      </h1>
      <Image
        src="/palms.gif"  // 👈 Next.js ya sabe que debe buscar en la carpeta public
        alt="Palms"
        width={40}
        height={40}
      />
    </nav>
  )
}

export default NavBar