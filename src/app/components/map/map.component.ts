// map.component.ts
import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
// @ts-ignore
import 'leaflet-draw';
// @ts-ignore
import 'leaflet-control-geocoder';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    // Add any components, directives, or pipes used in your template here
  ],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements AfterViewInit
{
  private map: L.Map | undefined;

  ngAfterViewInit(): void
  {
    this.initMap();
    this.addBaseLayers();
    this.addDrawingControls();
    this.addGeocoder();
  }

  private initMap(): void
  {
    this.map = L.map('map', {
      center: [51.505, -0.09],
      zoom: 13,
    });
  }

  private addBaseLayers(): void
  {
    const satellite = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { attribution: 'Satellite View' }
    );

    const plain = L.tileLayer(
      'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
      { attribution: 'Plain View' }
    );

    const baseMaps = {
      'Satellite View': satellite,
      'Plain View': plain,
    };

    satellite.addTo(this.map!);
    L.control.layers(baseMaps).addTo(this.map!);
  }

  private addDrawingControls(): void
  {
    const drawnItems = new L.FeatureGroup();
    this.map!.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      edit: { featureGroup: drawnItems },
      draw: {
        marker: false,
        polyline: false,
        rectangle: false,
        circle: false,
        circlemarker: false,
        polygon: {
          shapeOptions: {
            color: '#bada55'
          }
        }
      },
    });
    this.map!.addControl(drawControl);

    this.map!.on(L.Draw.Event.CREATED, (e: any) =>
    {
      const layer = e.layer;
      drawnItems.addLayer(layer);
      const geoJson = layer.toGeoJSON();
      console.log('Polygon GeoJSON:', geoJson);
      // Use geoJson for calculations
    });
  }

  private addGeocoder(): void
  {
    // @ts-ignore
    const geocoder = L.Control.Geocoder.nominatim();
    // @ts-ignore
    const control = L.Control.geocoder({
      query: '',
      placeholder: 'Search here...',
      defaultMarkGeocode: false,
      geocoder: geocoder,
    })
      .on('markgeocode', (e: any) =>
      {
        const bbox = e.geocode.bbox;
        const poly = L.polygon([
          [bbox.getSouthEast().lat, bbox.getSouthEast().lng],
          [bbox.getNorthEast().lat, bbox.getNorthEast().lng],
          [bbox.getNorthWest().lat, bbox.getNorthWest().lng],
          [bbox.getSouthWest().lat, bbox.getSouthWest().lng],
        ]).addTo(this.map!);
        this.map!.fitBounds(poly.getBounds());
      })
      .addTo(this.map!);
  }
}