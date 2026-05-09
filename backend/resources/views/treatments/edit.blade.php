@extends('layouts.admin')

@section('content')
<div class="max-w-3xl mx-auto">
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-slate-800">Modifier le soin : {{ $treatment->name }}</h1>
        <a href="{{ route('treatments.index') }}" class="text-sky-700 hover:underline">← Retour</a>
    </div>

    @if ($errors->any())
        <div class="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            @foreach ($errors->all() as $error)
                <p>{{ $error }}</p>
            @endforeach
        </div>
    @endif

    <form method="POST" action="{{ route('treatments.update', $treatment) }}" class="bg-white rounded-2xl shadow-sm p-6 space-y-5">
        @csrf
        @method('PUT')

        <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Nom</label>
            <input name="name" value="{{ old('name', $treatment->name) }}" required class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500" />
        </div>

        <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea name="description" rows="3" class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500">{{ old('description', $treatment->description) }}</textarea>
        </div>

        <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Prix</label>
            <input name="price" type="number" step="0.01" min="0" value="{{ old('price', $treatment->price) }}" required class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500" />
        </div>

        <div class="flex justify-end gap-3">
            <a href="{{ route('treatments.index') }}" class="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50">Annuler</a>
            <button type="submit" class="px-6 py-2 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-700">Mettre à jour</button>
        </div>
    </form>
</div>
@endsection
