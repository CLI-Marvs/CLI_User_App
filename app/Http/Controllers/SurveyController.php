<?php

namespace App\Http\Controllers;

use App\Models\Survey_list;
use Illuminate\Http\Request;

class SurveyController extends Controller
{
    public function store(Request $request)
    {
        $surveyData = $request->input('surveyData');

        foreach ($surveyData as $survey) {
            $newSurvey = Survey_list::create([
                'survey_title' => $survey['surveyTitle'],
                'status' => $survey['status'],
            ]);

            foreach ($survey['data'] as $form) {
                $newForm = $newSurvey->forms()->create([
                    'title' => $form['title'],
                    'description' => $form['description'],
                    'consentTitle' => $form['consentTitle'],
                    'consentDescription' => $form['consentDescription'],
                ]);

                foreach ($form['dataQASet'] as $question) {
                    $newQuestion = $newForm->questions()->create([
                        'question' => $question['question'],
                        'input_type' => $question['inputType'],
                        'required' => $question['required'],
                    ]);

                    foreach ($question['option'] as $option) {
                        $newQuestion->options()->create([
                            'text' => $option['text'],
                        ]);
                    }
                }
            }
        }

        return response()->json(['message' => 'Survey saved successfully']);
    }
}
