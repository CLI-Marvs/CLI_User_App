<?php

namespace App\Http\Controllers;

use App\Models\Survey_forms;
use App\Models\Survey_list;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SurveyController extends Controller
{
    public function store(Request $request)
    {
        $surveyData = $request->input('surveyData');
        $surveyId = null;  // Initialize the variable to store the survey ID

        foreach ($surveyData as $survey) {
            // Create the survey and capture its ID
            $newSurvey = Survey_list::create([
                'survey_title' => $survey['surveyTitle'] ?? 'Untitled Form',
                'status' => $survey['status'],
                'survey_link' => Str::uuid(),
            ]);

            // Set the survey ID
            $surveyId = $newSurvey->id;  // Capture the ID of the newly created survey

            foreach ($survey['data'] as $form) {
                $newForm = $newSurvey->forms()->create([
                    'title' => $form['title'],
                    'description' => $form['description'],
                    'consentTitle' => $form['consentTitle'],
                    'consentDescription' => $form['consentDescription'],
                ]);

                foreach ($form['dataQASet'] as $question) {
                    $newQuestion = $newForm->questions()->create([
                        'question' => $question['question'] ?? '',
                        'input_type' => $question['inputType'],
                        'required' => $question['required'],
                    ]);

                    foreach ($question['option'] as $option) {
                        $newQuestion->options()->create([
                            'text' => $option['text'] ?? '',
                        ]);
                    }
                }
            }
        }

        // Return the response with the survey ID
        return response()->json([
            'message' => 'Survey saved successfully',
            'survey_id' => $surveyId,  // Include the ID of the newly created survey
        ]);
    }



    public function update(Request $request, $id)
{
    $surveyData = $request->input('surveyData');

    $existingSurvey = Survey_list::findOrFail($id);

    if (!$existingSurvey->survey_link) {
        $existingSurvey->survey_link = Str::uuid();
    }

    // Update survey info
    $existingSurvey->update([
        'survey_title' => $surveyData[0]['surveyTitle'] ?? 'Untitled Form',
        'status' => $surveyData[0]['status'],
    ]);

    // Delete all existing related forms (and cascade questions/options)
    foreach ($existingSurvey->forms as $form) {
        foreach ($form->questions as $question) {
            $question->options()->delete();
        }
        $form->questions()->delete();
        $form->delete();
    }

    // Re-insert all forms, questions, and options
    foreach ($surveyData[0]['data'] as $formData) {
        $newForm = $existingSurvey->forms()->create([
            'title' => $formData['title'] ?? 'Untitled Form',
            'description' => $formData['description'],
            'consentTitle' => $formData['consentTitle'],
            'consentDescription' => $formData['consentDescription'],
        ]);

        foreach ($formData['dataQASet'] as $questionData) {
            $newQuestion = $newForm->questions()->create([
                'question' => $questionData['question'] ?? '',
                'input_type' => $questionData['inputType'],
                'required' => $questionData['required'],
            ]);

            foreach ($questionData['option'] as $optionData) {
                $newQuestion->options()->create([
                    'text' => $optionData['text'] ?? '',
                ]);
            }
        }
    }

    return response()->json(['message' => 'Survey updated (replaced) successfully']);
}



    public function fetchSurveys()
    {
        $surveys = Survey_list::all();
        return response()->json($surveys);
    }

    public function fetchSurvey($id)
    {
        try {
            $survey = Survey_list::find($id);

            if (!$survey) {
                return response()->json(['message' => 'Survey not found'], 404);
            }

            $forms = Survey_forms::with('questions.options')
                ->where('survey_id', $survey->id)
                ->get();


            $formattedSurvey = [
                [
                    'surveyTitle' => $survey->survey_title ?? '', // Assuming the 'title' field holds the survey title
                    'status' => $survey->status ?? false,
                    'data' => $forms->map(function ($form) {
                        return [
                            'id' => $form->id,
                            'title' => $form->title ?? 'Untitled Form',
                            'description' => $form->description ?? '',
                            'dataQASet' => $form->questions->map(function ($question) {
                                return [
                                    'id' => $question->id,
                                    'question' => $question->question ?? '',
                                    'inputType' => $question->input_type ?? 'dropdown',
                                    'option' => $question->options->map(function ($option) {
                                        return [
                                            'id' => $option->id,
                                            'text' => $option->text ?? '',
                                        ];
                                    })->toArray(),
                                    'required' => $question->required ?? false,
                                ];
                            })->toArray(),
                            'consentTitle' => $form->consentTitle ?? 'Declaration and Consent',
                            'consentDescription' => $form->consentDescription ??
                                'I hereby agree and consent to CLI and its authorized personnel collecting, storing, and processing the personal data I have provided in this form. This is for the purpose of proper identification and customer satisfaction reporting.',
                        ];
                    })->toArray(),
                ],
            ];

            return response()->json($formattedSurvey);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error fetching survey', 'error' => $e->getMessage()], 500);
        }
    }


    public function delete($id)
    {
        // Find the survey by ID
        $survey = Survey_list::find($id);

        // Check if survey exists
        if (!$survey) {
            return response()->json(['message' => 'Survey not found'], 404);
        }


        foreach ($survey->forms as $form) {
            foreach ($form->questions as $question) {
                $question->options()->delete();
            }
            $form->questions()->delete();
        }
        $survey->forms()->delete();


        $survey->delete();

        return response()->json(['message' => 'Survey and all related data deleted successfully!']);
    }
}
