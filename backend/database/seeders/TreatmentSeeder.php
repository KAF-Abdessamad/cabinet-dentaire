<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TreatmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $treatments = [
            [
                'name' => 'Consultation Dentaire',
                'description' => 'Examen complet de la dentition et diagnostic.',
                'price' => 200,
            ],
            [
                'name' => 'Détartrage et Polissage',
                'description' => 'Nettoyage professionnel pour éliminer le tartre et les taches.',
                'price' => 400,
            ],
            [
                'name' => 'Extraction Simple',
                'description' => 'Retrait d\'une dent endommagée ou gênante.',
                'price' => 300,
            ],
            [
                'name' => 'Blanchiment Dentaire',
                'description' => 'Traitement esthétique pour éclaircir la couleur des dents.',
                'price' => 1500,
            ],
            [
                'name' => 'Pose de Couronne',
                'description' => 'Restauration d\'une dent avec une couronne en céramique.',
                'price' => 2500,
            ],
            [
                'name' => 'Traitement de Carie',
                'description' => 'Obturation (plombage) d\'une dent cariée.',
                'price' => 350,
            ],
            [
                'name' => 'Urgences - Douleur Vive',
                'description' => 'Consultation prioritaire pour soulager une douleur aiguë.',
                'price' => 250,
            ],
        ];

        foreach ($treatments as $treatment) {
            \App\Models\Treatment::updateOrCreate(
                ['name' => $treatment['name']],
                $treatment
            );
        }
    }
}
