import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit2, Trash2, MapPin, Target, Map, AlertCircle, MapPinned, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapEvents({ onLocationSelected }) {
    useMapEvents({
        click(e) {
            onLocationSelected(e);
        },
    });
    return null;
}

function MapViewUpdater({ center, zoom }) {
    const map = useMap();
    const centerStr = center ? `${center[0]},${center[1]}` : '';
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (center && !isNaN(center[0]) && !isNaN(center[1])) {
            map.flyTo(center, zoom || 16, { animate: true, duration: 1.0 });
        }
    }, [centerStr, map]);
    return null;
}

export default function Locations({ locations }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [mapKey, setMapKey] = useState(0);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        latitude: '',
        longitude: '',
        radius: '',
    });

    const defaultPosition = [-2.5489, 118.0149]; // Center of Indonesia

    const getCurrentPosition = () => {
        if (data.latitude && data.longitude) {
            const lat = parseFloat(data.latitude);
            const lng = parseFloat(data.longitude);
            if (!isNaN(lat) && !isNaN(lng)) {
                return [lat, lng];
            }
        }
        return defaultPosition;
    };

    const handleMapClick = (e) => {
        setData(d => ({
            ...d,
            latitude: e.latlng.lat.toFixed(6),
            longitude: e.latlng.lng.toFixed(6)
        }));
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!searchQuery) return;
        setIsSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const results = await res.json();
            if (results && results.length > 0) {
                const { lat, lon } = results[0];
                setData(d => ({ ...d, latitude: lat, longitude: lon }));
            }
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const openCreateModal = () => {
        clearErrors();
        reset();
        setSearchQuery('');
        setMapKey(k => k + 1);
        setIsCreateModalOpen(true);
    };

    const openEditModal = (loc) => {
        clearErrors();
        setSearchQuery('');
        setSelectedLocation(loc);
        setData({
            name: loc.name,
            latitude: loc.latitude,
            longitude: loc.longitude,
            radius: loc.radius,
        });
        setMapKey(k => k + 1);
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (loc) => {
        setSelectedLocation(loc);
        setIsDeleteModalOpen(true);
    };

    const handleCreate = (e) => {
        e.preventDefault();
        post(route('campus-locations.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        put(route('campus-locations.update', selectedLocation.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            },
        });
    };

    const handleDelete = () => {
        destroy(route('campus-locations.destroy', selectedLocation.id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedLocation(null);
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-2 mb-2">
                            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest flex items-center shadow-sm">
                                <Target className="w-3 h-3 mr-1.5" />
                                Geofencing
                            </span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Lokasi <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Kampus</span>
                        </h2>
                    </div>
                    <Button 
                        onClick={openCreateModal}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_10px_25px_rgba(16,185,129,0.4)] transition-all hover:-translate-y-0.5"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Tambah Lokasi
                    </Button>
                </div>
            }
        >
            <Head title="Lokasi Kampus" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="pb-8"
            >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Maps / Visual Illustration */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 backdrop-blur-xl overflow-hidden">
                            <CardHeader className="border-b border-slate-50/50 bg-gradient-to-r from-emerald-50 to-teal-50 p-5">
                                <CardTitle className="text-lg font-black text-emerald-900 flex items-center">
                                    <Map className="w-5 h-5 mr-2 text-emerald-600" /> Peta Overview
                                </CardTitle>
                                <CardDescription className="text-xs font-bold text-emerald-700/70 uppercase tracking-widest mt-0.5">
                                    {locations.length} Titik Lokasi • Geofencing Aktif
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="h-[360px] w-full">
                                    {locations.length > 0 ? (
                                        <MapContainer
                                            key="overview-map"
                                            center={[parseFloat(locations[0].latitude), parseFloat(locations[0].longitude)]}
                                            zoom={14}
                                            scrollWheelZoom={true}
                                            style={{ height: '100%', width: '100%' }}
                                            className="rounded-b-[2rem]"
                                        >
                                            <TileLayer
                                                attribution='&copy; <a href="https://osm.org">OpenStreetMap</a>'
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            {locations.map((loc) => (
                                                <React.Fragment key={loc.id}>
                                                    <Marker position={[parseFloat(loc.latitude), parseFloat(loc.longitude)]} />
                                                    <Circle
                                                        center={[parseFloat(loc.latitude), parseFloat(loc.longitude)]}
                                                        radius={parseInt(loc.radius)}
                                                        pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.15, weight: 2 }}
                                                    />
                                                </React.Fragment>
                                            ))}
                                        </MapContainer>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8">
                                            <MapPinned className="w-12 h-12 mb-3 text-slate-200" />
                                            <p className="font-bold text-slate-500 text-sm">Belum ada lokasi</p>
                                            <p className="text-xs text-slate-400">Tambahkan titik kampus untuk melihat peta.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Data Table */}
                    <div className="lg:col-span-2">
                        <Card className="border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white/80 backdrop-blur-xl overflow-hidden h-full">
                            <CardHeader className="border-b border-slate-50/50 bg-white/50 p-6">
                                <CardTitle className="text-xl font-black text-slate-900">Daftar Titik Kampus</CardTitle>
                                <CardDescription className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                                    Koordinat GPS dan Radius Presensi
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-slate-50/50">
                                            <TableRow className="hover:bg-transparent border-b-slate-100">
                                                <TableHead className="font-black text-slate-900 px-6 py-5">Nama Lokasi</TableHead>
                                                <TableHead className="font-black text-slate-900">Koordinat (Lat, Lng)</TableHead>
                                                <TableHead className="font-black text-slate-900 text-center">Radius</TableHead>
                                                <TableHead className="font-black text-slate-900 text-right px-6">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <AnimatePresence>
                                                {locations.map((loc) => (
                                                    <motion.tr 
                                                        key={loc.id}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="group hover:bg-slate-50/50 transition-colors border-b-slate-50"
                                                    >
                                                        <TableCell className="px-6 py-4">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                                                    <MapPin className="w-4 h-4 text-emerald-600" />
                                                                </div>
                                                                <span className="font-bold text-slate-900">{loc.name}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span className="font-mono text-sm text-slate-600">{loc.latitude}</span>
                                                                <span className="font-mono text-sm text-slate-600">{loc.longitude}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <span className="font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-sm">
                                                                {loc.radius} M
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="px-6 text-right">
                                                            <div className="flex items-center justify-end space-x-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button 
                                                                    onClick={() => openEditModal(loc)}
                                                                    variant="outline" 
                                                                    size="icon" 
                                                                    className="h-8 w-8 rounded-xl border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                </Button>
                                                                <Button 
                                                                    onClick={() => openDeleteModal(loc)}
                                                                    variant="outline" 
                                                                    size="icon" 
                                                                    className="h-8 w-8 rounded-xl border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </motion.tr>
                                                ))}
                                                {locations.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-center py-16">
                                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                                <Map className="w-12 h-12 mb-4 text-slate-200" />
                                                                <p className="font-bold text-slate-500">Belum ada data lokasi</p>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </AnimatePresence>
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </motion.div>

            {/* Create/Edit Modal */}
            <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
                if (!open) {
                    setIsCreateModalOpen(false);
                    setIsEditModalOpen(false);
                }
            }}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-[2rem] p-0 border-none shadow-[0_20px_60px_rgba(0,0,0,0.1)]">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white relative overflow-hidden shrink-0">
                        <div className="absolute -right-4 -bottom-4 opacity-20">
                            <Target className="w-32 h-32" />
                        </div>
                        <DialogTitle className="text-2xl font-black relative z-10">
                            {isEditModalOpen ? 'Edit Lokasi Kampus' : 'Tambah Lokasi Baru'}
                        </DialogTitle>
                        <DialogDescription className="text-emerald-100 font-medium mt-2 relative z-10">
                            Pilih titik pada peta interaktif atau masukkan koordinat secara manual.
                        </DialogDescription>
                    </div>
                    
                    <form onSubmit={isEditModalOpen ? handleEdit : handleCreate} className="p-8 bg-slate-50">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="font-bold text-slate-700">Nama Lokasi</Label>
                                <Input 
                                    id="name" 
                                    value={data.name} 
                                    onChange={e => setData('name', e.target.value)} 
                                    placeholder="Contoh: Gedung A, Kampus Pusat..."
                                    className="rounded-xl border-slate-200 focus-visible:ring-emerald-500 h-11 shadow-sm font-semibold"
                                />
                                {errors.name && <p className="text-rose-500 text-xs font-bold">{errors.name}</p>}
                            </div>

                            <div className="space-y-2 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                <Label className="font-bold text-slate-700 flex items-center mb-3">
                                    <Map className="w-4 h-4 mr-2 text-emerald-600" />
                                    Cari & Tentukan Titik Lokasi (Live Map)
                                </Label>
                                <div className="flex space-x-2 mb-4">
                                    <Input 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleSearch(e); } }}
                                        placeholder="Cari nama gedung, jalan, atau kota..."
                                        className="rounded-xl border-slate-200 focus-visible:ring-emerald-500 h-11 shadow-sm font-semibold flex-1"
                                    />
                                    <Button 
                                        type="button" 
                                        onClick={handleSearch}
                                        disabled={isSearching}
                                        className="h-11 rounded-xl bg-slate-800 hover:bg-slate-900 text-white px-4 shrink-0"
                                    >
                                        <Search className="w-4 h-4 mr-2" />
                                        {isSearching ? 'Mencari...' : 'Cari'}
                                    </Button>
                                </div>
                                
                                <div className="h-[250px] w-full rounded-xl overflow-hidden border border-slate-200 z-0 relative">
                                    <MapContainer 
                                        key={mapKey}
                                        center={getCurrentPosition()} 
                                        zoom={data.latitude ? 16 : 5} 
                                        scrollWheelZoom={true} 
                                        style={{ height: '100%', width: '100%', zIndex: 1 }}
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <MapEvents onLocationSelected={handleMapClick} />
                                        <MapViewUpdater center={getCurrentPosition()} zoom={data.latitude ? 16 : 5} />
                                        
                                        {data.latitude && data.longitude && !isNaN(parseFloat(data.latitude)) && !isNaN(parseFloat(data.longitude)) && (
                                            <>
                                                <Marker 
                                                    position={[parseFloat(data.latitude), parseFloat(data.longitude)]}
                                                    draggable={true}
                                                    eventHandlers={{
                                                        dragend: (e) => {
                                                            const marker = e.target;
                                                            const position = marker.getLatLng();
                                                            setData(d => ({
                                                                ...d,
                                                                latitude: position.lat.toFixed(6),
                                                                longitude: position.lng.toFixed(6)
                                                            }));
                                                        },
                                                    }}
                                                />
                                                {data.radius && !isNaN(parseFloat(data.radius)) && (
                                                    <Circle 
                                                        center={[parseFloat(data.latitude), parseFloat(data.longitude)]} 
                                                        radius={parseFloat(data.radius)}
                                                        pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.2 }}
                                                    />
                                                )}
                                            </>
                                        )}
                                    </MapContainer>
                                </div>
                                <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">*Klik pada peta atau geser <span className="font-bold text-slate-700">pin biru</span> untuk memperbarui Latitude & Longitude secara otomatis.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="latitude" className="font-bold text-slate-700">Latitude</Label>
                                    <Input 
                                        id="latitude" 
                                        value={data.latitude} 
                                        onChange={e => setData('latitude', e.target.value)} 
                                        placeholder="-6.712345"
                                        className="rounded-xl border-slate-200 focus-visible:ring-emerald-500 h-11 shadow-sm font-semibold font-mono bg-slate-100"
                                    />
                                    {errors.latitude && <p className="text-rose-500 text-xs font-bold">{errors.latitude}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="longitude" className="font-bold text-slate-700">Longitude</Label>
                                    <Input 
                                        id="longitude" 
                                        value={data.longitude} 
                                        onChange={e => setData('longitude', e.target.value)} 
                                        placeholder="108.512345"
                                        className="rounded-xl border-slate-200 focus-visible:ring-emerald-500 h-11 shadow-sm font-semibold font-mono bg-slate-100"
                                    />
                                    {errors.longitude && <p className="text-rose-500 text-xs font-bold">{errors.longitude}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="radius" className="font-bold text-slate-700">Radius Toleransi (Meter)</Label>
                                <div className="relative">
                                    <Input 
                                        id="radius" type="number" 
                                        value={data.radius} 
                                        onChange={e => setData('radius', e.target.value)} 
                                        className="rounded-xl border-slate-200 focus-visible:ring-emerald-500 h-11 shadow-sm font-semibold pr-12 text-indigo-700"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                                        Meter
                                    </div>
                                </div>
                                {errors.radius && <p className="text-rose-500 text-xs font-bold">{errors.radius}</p>}
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end space-x-3">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}
                                className="rounded-xl font-bold h-11 px-6 border-slate-200 text-slate-600 hover:bg-slate-100"
                            >
                                Batal
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={processing}
                                className="rounded-xl font-bold h-11 px-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200"
                            >
                                Simpan Data
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-[2rem] p-8 text-center border-none shadow-[0_20px_60px_rgba(0,0,0,0.1)]">
                    <div className="mx-auto w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-6">
                        <AlertCircle className="w-8 h-8 text-rose-600" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-slate-900 mb-2">Hapus Lokasi?</DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium mb-8 text-base">
                        Anda yakin ingin menghapus lokasi <span className="font-bold text-slate-900">{selectedLocation?.name}</span>? Titik ini tidak bisa lagi digunakan untuk presensi.
                    </DialogDescription>
                    
                    <div className="flex flex-col space-y-3">
                        <Button 
                            onClick={handleDelete} 
                            disabled={processing}
                            className="w-full rounded-xl font-bold h-12 bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200"
                        >
                            Ya, Hapus Lokasi
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="w-full rounded-xl font-bold h-12 border-slate-200 text-slate-600 hover:bg-slate-50"
                        >
                            Batal
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

        </AuthenticatedLayout>
    );
}
