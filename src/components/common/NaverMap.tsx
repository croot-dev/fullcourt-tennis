'use client'

import { useEffect, useRef } from 'react'
import { Box } from '@chakra-ui/react'
import { useAlertDialog } from '@/components/ui/alert-dialog'
import type { TennisCourt } from '@/domains/court/court.model'
import styles from './NaverMap.module.css'
import Script from 'next/script'

interface NaverMapProps {
  courts: TennisCourt[]
  selectedCourt?: TennisCourt | null
  height?: string
}

interface ExtendedCourt extends TennisCourt {
  address: string
  location: MapLocation
}

interface MapLocation {
  x: number
  y: number
  _lat: number
  _lng: number
}

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    naver: any
    navermap_authFailure?: () => void
    closeNaverInfoWindow?: (courtId: string | number) => void
  }
}

function getCourtUrl(court: TennisCourt): string | undefined {
  return (
    court.rsv_url ||
    (court.naver_place_id
      ? `https://map.naver.com/p/entry/place/${court.naver_place_id}`
      : undefined)
  )
}

function createInfoWindowContent(courtInfo: ExtendedCourt): string {
  const { court_id, name, is_indoor, address } = courtInfo
  const url = getCourtUrl(courtInfo)
  const typeLabel = is_indoor ? '실내' : '야외'
  const naverMapUrl = `https://map.naver.com/v5/search/${encodeURIComponent(address || '')}`

  // 복사 아이콘 SVG (Lucide copy icon)
  const copyIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`

  // 공유 아이콘 SVG (Lucide share icon)
  const shareIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>`

  // 공유하기 함수
  const shareData = JSON.stringify({
    title: name,
    text: `${name} - ${address}`,
    url: naverMapUrl,
  })

  const shareScript = `
    if (navigator.share) {
      navigator.share(${shareData}).catch(() => {});
    } else {
      navigator.clipboard.writeText('${naverMapUrl}').then(() => alert('링크가 복사되었습니다.')).catch(() => {});
    }
    `

  // 닫기 아이콘 SVG (Lucide share icon)
  const closeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`

  const badgeClass = is_indoor
    ? styles.infoWindowBadgeIndoor
    : styles.infoWindowBadgeOutdoor

  return `
    <div class="${styles.infoWindow}">
      <div class="${styles.infoWindowHeader}">
        <div>
          <strong class="${styles.infoWindowTitle}">${name}</strong>
          <span class="${styles.infoWindowBadge} ${badgeClass}">${typeLabel}</span>
        </div>
        <div class="${styles.infoWindowSideBox}">
          <button onclick="${shareScript.replace(/"/g, '&quot;')}" class="${styles.infoWindowIconButton}" title="공유하기">${shareIcon}</button>
          <button onclick="window.closeNaverInfoWindow && window.closeNaverInfoWindow('${court_id}')" class="${styles.infoWindowIconButton}" title="정보창 닫기">${closeIcon}</button>
        </div>
      </div>
      <div class="${styles.infoWindowAddressRow}">
        <p class="${styles.infoWindowAddress}">${address}</p>
        <button onclick="navigator.clipboard.writeText('${address}').then(() => this.innerHTML = '✓').catch(() => {})" class="${styles.infoWindowCopyButton}" title="주소 복사">${copyIcon}</button>
      </div>
      <div class="${styles.infoWindowButtons}">
        <a href="${naverMapUrl}" target="_blank" rel="noopener noreferrer" class="${styles.infoWindowButton} ${styles.infoWindowButtonNaver}">네이버 지도</a>
        <a href="${url}?placePath=/ticket" target="_blank" rel="noopener noreferrer" class="${styles.infoWindowButton} ${styles.infoWindowButtonReservation}">예약하기</a>
      </div>
    </div>
  `
}

interface SearchPlaceResult {
  name: string
  address: string
  x: number
  y: number
  telephone: string
  category: string
}

async function searchPlace(query: string): Promise<SearchPlaceResult | null> {
  try {
    const response = await fetch(
      `/api/naver/search?query=${encodeURIComponent(query)}`,
    )

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Search place error:', error)
    return null
  }
}

function loadMapTypeSelector(map: any) {
  window.naver.maps.Event.once(map, 'init', function () {
    map.setOptions({
      mapTypeControl: true,
      scaleControl: true,
      logoControl: false,
      mapDataControl: false,
      zoomControl: false,
    })
  })
}

interface MarkerWithInfoWindow {
  marker: any
  infoWindow: any
  court: ExtendedCourt
}

function createMarkerIcon(isIndoor: boolean | null): any {
  const color = isIndoor ? '#ED8936' : '#38A169' // 주황색(indoor) / 초록색(outdoor)

  return {
    content: `
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
        <path fill="${color}" stroke="#fff" stroke-width="1.5" d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.27 21.73 0 14 0z"/>
        <circle fill="#fff" cx="14" cy="14" r="6"/>
      </svg>
    `,
    anchor: new window.naver.maps.Point(14, 40),
  }
}

function createMarkerWithInfoWindow(
  map: any,
  info: ExtendedCourt,
  allInfoWindows: any[],
): MarkerWithInfoWindow {
  // 마커 생성 (실내/야외에 따라 다른 색상)
  const marker = new window.naver.maps.Marker({
    position: info.location,
    map: map,
    title: info.name,
    icon: createMarkerIcon(info.is_indoor),
  })

  // InfoWindow 생성
  const infoWindow = new window.naver.maps.InfoWindow({
    content: createInfoWindowContent(info),
    borderWidth: 0,
    backgroundColor: 'white',
    borderColor: 'transparent',
    anchorSize: { width: 10, height: 10 },
    anchorSkew: true,
    pixelOffset: { x: 0, y: -5 },
  })

  // 마커 클릭 시 InfoWindow 토글 (다른 InfoWindow는 닫기)
  window.naver.maps.Event.addListener(marker, 'click', () => {
    // 다른 모든 InfoWindow 닫기
    allInfoWindows.forEach((iw) => iw.close())

    if (infoWindow.getMap()) {
      infoWindow.close()
    } else {
      infoWindow.open(map, marker)
      map.setZoom(16)
      map.setCenter({
        x: marker.position.x,
        y: marker.position.y + 0.0015,
      })
    }
  })

  return { marker, infoWindow, court: info }
}

export default function NaverMap({
  courts,
  selectedCourt,
  height = '300px',
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<MarkerWithInfoWindow[]>([])
  const { alert } = useAlertDialog()

  // 모든 코트 로드 및 지도 초기화
  const initMap = async () => {
    // 인증 실패 핸들러 등록
    window.navermap_authFailure = () => {
      alert({
        title: '지도 인증 실패',
        message: '네이버 지도 인증에 실패했습니다. API 키를 확인해주세요.',
      })
    }

    if (!mapRef.current || !window.naver || courts.length === 0) return

    // 모든 코트의 위치 검색
    const courtResults = await Promise.all(
      courts.map(async (court) => {
        const result = await searchPlace(court.name)
        if (!result) return null
        return {
          ...court,
          address: result.address,
          location: new window.naver.maps.LatLng(result.y, result.x),
        } as ExtendedCourt
      }),
    )

    const validCourts = courtResults.filter(
      (c): c is ExtendedCourt => c !== null,
    )
    if (validCourts.length === 0) return

    // 모든 마커를 포함하는 bounds 계산
    const bounds = new window.naver.maps.LatLngBounds()
    validCourts.forEach((court) => bounds.extend(court.location))

    // 지도 생성
    const map = new window.naver.maps.Map(mapRef.current!, {
      zoom: 12,
      minZoom: 11,
      maxZoom: 20,
    })

    // bounds에 맞게 지도 영역 조정
    map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 })

    mapInstanceRef.current = map
    loadMapTypeSelector(map)

    // 모든 마커 생성
    const infoWindows: any[] = []
    const markers = validCourts.map((court) => {
      const markerWithIW = createMarkerWithInfoWindow(map, court, infoWindows)
      infoWindows.push(markerWithIW.infoWindow)
      return markerWithIW
    })

    markersRef.current = markers

    // InfoWindow 닫기 전역 함수 등록
    window.closeNaverInfoWindow = (courtId: string | number) => {
      const markerData = markersRef.current.find(
        (m) => String(m.court.court_id) === String(courtId),
      )
      if (markerData) {
        markerData.infoWindow.close()
      }
    }
  }

  // 선택된 코트로 포커스
  useEffect(() => {
    if (
      !selectedCourt ||
      !mapInstanceRef.current ||
      markersRef.current.length === 0
    )
      return

    const markerData = markersRef.current.find(
      (m) => m.court.court_id === selectedCourt.court_id,
    )

    if (markerData) {
      const { marker, infoWindow, court } = markerData
      const map = mapInstanceRef.current

      // 다른 모든 InfoWindow 닫기
      markersRef.current.forEach((m) => m.infoWindow.close())

      // 선택된 코트로 이동 및 InfoWindow 열기
      map.setCenter({
        x: court.location.x,
        y: court.location.y + 0.0015,
      })
      map.setZoom(16)

      infoWindow.open(map, marker)
    }
  }, [selectedCourt])

  useEffect(() => {
    initMap()
  }, [courts])

  return (
    <>
      <Script
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NCP_CLIENT_ID}`}
        onLoad={initMap}
      />
      <Box
        ref={mapRef}
        width="100%"
        height={height}
        borderRadius="md"
        overflow="hidden"
      />
    </>
  )
}
