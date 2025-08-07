//LeafletMapView.js
import React, { useRef, useEffect } from 'react';
import { WebView } from 'react-native-webview';

const LeafletMapView = React.forwardRef(
  (
    {
      region,
      polygonCoords,
      mapLayer,
      onMapClick,
      areaCenter,
      area,
      sideLengths,
    },
    ref
  ) => {
    const webViewRef = useRef(null);

    // Função para enviar dados de inicialização e, se houver, os pontos do polígono
    const sendInitMessage = () => {
      if (region) {
        const initData = {
          type: 'init',
          region,
          mapLayer,
        };
        webViewRef.current.postMessage(JSON.stringify(initData));
        // Se já houver pontos definidos (modo edição), envie também a atualização do polígono
        if (polygonCoords && polygonCoords.length > 0) {
          const updateData = {
            type: 'updatePolygon',
            polygonCoords,
            area,
            areaCenter,
            sideLengths,
          };
          webViewRef.current.postMessage(JSON.stringify(updateData));
        }
      }
    };

    // Sempre que polygonCoords, area, areaCenter ou sideLengths mudar, envia atualização do polígono
    useEffect(() => {
      const updateData = {
        type: 'updatePolygon',
        polygonCoords,
        area,
        areaCenter,
        sideLengths,
      };
      if (webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify(updateData));
      }
    }, [polygonCoords, area, areaCenter, sideLengths]);

    // Se a região ou a camada mudar, reenvia a mensagem de inicialização
    useEffect(() => {
      if (region) {
        const data = {
          type: 'init',
          region,
          mapLayer,
        };
        if (webViewRef.current) {
          webViewRef.current.postMessage(JSON.stringify(data));
        }
      }
    }, [region, mapLayer]);

    // Expondo métodos para o componente pai (centralizar, alternar camada, limpar polígono)
    React.useImperativeHandle(ref, () => ({
      centerMap: (newRegion) => {
        const data = { type: 'centerMap', region: newRegion };
        webViewRef.current.postMessage(JSON.stringify(data));
      },
      toggleMapLayer: (newLayer) => {
        const data = { type: 'toggleMapLayer', mapLayer: newLayer };
        webViewRef.current.postMessage(JSON.stringify(data));
      },
      clearPolygon: () => {
        const data = { type: 'clearPolygon' };
        webViewRef.current.postMessage(JSON.stringify(data));
      },
    }));

    // Manipula mensagens vindas do WebView
    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'mapClick' && onMapClick) {
          onMapClick(data.coordinate);
        }
      } catch (error) {
        console.error('Erro ao interpretar mensagem do WebView', error);
      }
    };

    // HTML que será carregado no WebView
    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
        <style>
          html, body, #map { height: 100%; margin: 0; padding: 0; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
        <script>
          var map;
          var polygonLayer;
          var currentLayer;
          var markersGroup;
  
          function initMap(region, mapLayer) {
            var lat = region.latitude;
            var lng = region.longitude;
            map = L.map('map').setView([lat, lng], 17);
            var streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 });
            var satelliteLayer = L.tileLayer('https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 });
  
            currentLayer = (mapLayer === 'satellite') ? satelliteLayer : streetLayer;
            currentLayer.addTo(map);
            markersGroup = L.layerGroup().addTo(map);
  
            map.on('click', function(e) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapClick', coordinate: { latitude: e.latlng.lat, longitude: e.latlng.lng } }));
            });
          }
  
          // Função para converter coordenadas (lat/lon) em metros usando a fórmula de Haversine
          function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
            var R = 6371000; // Raio da Terra em metros
            var dLat = (lat2 - lat1) * (Math.PI / 180);
            var dLon = (lon2 - lon1) * (Math.PI / 180);
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c; // Distância em metros
          }
  
          function updatePolygon(polygonCoords, area, areaCenter, sideLengths) {
            if (polygonLayer) {
              map.removeLayer(polygonLayer);
            }
            if (markersGroup) {
              markersGroup.clearLayers();
            }
            if (polygonCoords && polygonCoords.length > 0) {
              var latlngs = polygonCoords.map(function(pt){ return [pt.latitude, pt.longitude]; });
              polygonLayer = L.polygon(latlngs, { color: 'green', fillColor: 'rgba(0,255,0,0.5)', weight: 2 });
              polygonLayer.addTo(map);
  
              // Adicionar marcadores nos vértices do polígono
              polygonCoords.forEach(function(pt) {
                L.marker([pt.latitude, pt.longitude]).addTo(markersGroup);
              });
  
              // Exibir a área no centro do polígono
              if (area && areaCenter) {
                L.marker([areaCenter.latitude, areaCenter.longitude])
                  .bindTooltip(\`Área: \${area} hectares\`, { permanent: true, direction: 'center' })
                  .addTo(markersGroup);
              }
  
              // Calcular e exibir comprimentos dos lados em metros
              if (polygonCoords.length > 1) {
                for (let i = 0; i < polygonCoords.length; i++) {
                  const start = polygonCoords[i];
                  const end = polygonCoords[(i + 1) % polygonCoords.length];
  
                  // Calcula a distância real entre os pontos em metros
                  const lengthInMeters = getDistanceFromLatLonInMeters(
                    start.latitude,
                    start.longitude,
                    end.latitude,
                    end.longitude
                  );
  
                  const midPoint = {
                    lat: (start.latitude + end.latitude) / 2,
                    lng: (start.longitude + end.longitude) / 2
                  };
  
                  L.marker([midPoint.lat, midPoint.lng])
                    .bindTooltip(\`Lado \${i + 1}: \${lengthInMeters.toFixed(2)} m\`, { permanent: true })
                    .addTo(markersGroup);
                }
              }
            }
          }
  
          function clearPolygon() {
            if (polygonLayer) {
              map.removeLayer(polygonLayer);
              polygonLayer = null;
            }
            if (markersGroup) {
              markersGroup.clearLayers();
            }
          }
  
          function centerMap(region) {
            if (map && region) {
              map.setView([region.latitude, region.longitude], 17);
            }
          }
  
          function toggleMapLayer(newLayer) {
            if (currentLayer) {
              map.removeLayer(currentLayer);
            }
            var streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 });
            var satelliteLayer = L.tileLayer('https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 });
  
            currentLayer = (newLayer === 'satellite') ? satelliteLayer : streetLayer;
            currentLayer.addTo(map);
          }
  
          function handleMessage(event) {
            var data = JSON.parse(event.data);
            if(data.type === 'init'){
              initMap(data.region, data.mapLayer);
            } else if(data.type === 'updatePolygon'){
              updatePolygon(data.polygonCoords, data.area, data.areaCenter, data.sideLengths);
            } else if(data.type === 'clearPolygon'){
              clearPolygon();
            } else if(data.type === 'centerMap'){
              centerMap(data.region);
            } else if(data.type === 'toggleMapLayer'){
              toggleMapLayer(data.mapLayer);
            }
          }
  
          document.addEventListener("message", handleMessage);
          window.addEventListener("message", handleMessage);
        </script>
      </body>
    </html>
  `;
  

    return (
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        javaScriptEnabled={true}
        onMessage={handleMessage}
        onLoadEnd={sendInitMessage}
        style={{ flex: 1 }}
      />
    );
  }
);

export default LeafletMapView;
