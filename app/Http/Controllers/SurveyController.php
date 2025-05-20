<?php

namespace App\Http\Controllers;

use App\Models\Survey_forms;
use App\Models\Survey_list;
use App\Models\Survey_questions;
use App\Models\SurveyAnswer;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;


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

        $existingSurvey->update([
            'survey_title' => $surveyData[0]['surveyTitle'] ?? 'Untitled Form',
            'status' => $surveyData[0]['status'],
        ]);

        $newFormIds = [];

        foreach ($surveyData[0]['data'] as $formData) {
            // Update or create form
            if (isset($formData['id']) && is_numeric($formData['id'])) {
                $form = $existingSurvey->forms()->find($formData['id']);
                if ($form) {
                    $form->update([
                        'title' => $formData['title'] ?? 'Untitled Form',
                        'description' => $formData['description'],
                        'consentTitle' => $formData['consentTitle'],
                        'consentDescription' => $formData['consentDescription'],
                    ]);
                } else {
                    continue;
                }
            } else {
                $form = $existingSurvey->forms()->create([
                    'title' => $formData['title'] ?? 'Untitled Form',
                    'description' => $formData['description'],
                    'consentTitle' => $formData['consentTitle'],
                    'consentDescription' => $formData['consentDescription'],
                ]);
            }

            $newFormIds[] = $form->id;

            $newQuestionIds = [];

            foreach ($formData['dataQASet'] as $questionData) {
                // Update or create question
                if (isset($questionData['id']) && is_numeric($questionData['id'])) {
                    $question = $form->questions()->find($questionData['id']);
                    if ($question) {
                        $question->update([
                            'question' => $questionData['question'] ?? '',
                            'input_type' => $questionData['inputType'],
                            'required' => $questionData['required'],
                        ]);
                    } else {
                        continue;
                    }
                } else {
                    $question = $form->questions()->create([
                        'question' => $questionData['question'] ?? '',
                        'input_type' => $questionData['inputType'],
                        'required' => $questionData['required'],
                    ]);
                }

                $newQuestionIds[] = $question->id;

                $newOptionIds = [];

                foreach ($questionData['option'] as $optionData) {
                    // Update or create option
                    if (isset($optionData['id']) && is_numeric($optionData['id'])) {
                        $option = $question->options()->find($optionData['id']);
                        if ($option) {
                            $option->update([
                                'text' => $optionData['text'] ?? '',
                            ]);
                        } else {
                            continue;
                        }
                    } else {
                        $option = $question->options()->create([
                            'text' => $optionData['text'] ?? '',
                        ]);
                    }

                    $newOptionIds[] = $option->id;
                }

                // Delete options not in newOptionIds
                $question->options()->whereNotIn('id', $newOptionIds)->delete();
            }

            // Delete questions not in newQuestionIds
            $form->questions()->whereNotIn('id', $newQuestionIds)->delete();
        }

        // Delete forms not in newFormIds
        $existingSurvey->forms()->whereNotIn('id', $newFormIds)->delete();

        return response()->json(['message' => 'Survey updated successfully']);
    }

    public function updateTitle(Request $request, $id)
    {
        $surveyTitle = $request->input('surveyTitle');

        $existingSurvey = Survey_list::findOrFail($id);

        $existingSurvey->update([
            'survey_title' => $surveyTitle ?? 'Untitled Form',
        ]);

        return response()->json(['message' => 'Survey title updated successfully']);
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
                            'dataQASet' => $form->questions
                                ->sortBy('id')
                                ->values()
                                ->map(function ($question) {
                                    return [
                                        'id' => $question->id,
                                        'question' => $question->question ?? '',
                                        'inputType' => $question->input_type ?? 'dropdown',
                                        'option' => $question->options
                                            ->sortBy('id')
                                            ->map(function ($option) {
                                                return [
                                                    'id' => $option->id,
                                                    'text' => $option->text ?? '',
                                                ];
                                            })->values()->toArray(),
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

    public function getSurveyStats($survey_list_id)
    {
        try {
            // Get the survey title
            $survey = DB::table('surveys_list')
                ->where('id', $survey_list_id)
                ->select('survey_title')
                ->first();

            if (!$survey) {
                return response()->json(['error' => 'Survey not found'], 404);
            }

            // Get valid options for all questions in the survey
            $validOptions = DB::table('survey_options')
                ->whereIn('question_id', function ($query) use ($survey_list_id) {
                    // Join survey_questions with survey_forms to get the survey_id
                    $query->select('survey_questions.id')
                        ->from('survey_questions')
                        ->join('survey_forms', 'survey_questions.form_id', '=', 'survey_forms.id')
                        ->where('survey_forms.survey_id', $survey_list_id);  // Use survey_id from survey_forms
                })
                ->pluck('text', 'id')
                ->toArray(); // Convert to an array for easy access

            // Get the questions for this survey
            $questions = DB::table('survey_questions')
                ->join('survey_forms', 'survey_questions.form_id', '=', 'survey_forms.id')
                ->where('survey_forms.survey_id', $survey_list_id)  // Join to filter by survey_id
                ->select('survey_questions.id', 'survey_questions.question')
                ->get();

            $questionsResult = [];

            // Process each question
            foreach ($questions as $question) {
                // Get options for this specific question
                $options = DB::table('survey_options')
                    ->where('question_id', $question->id)
                    ->pluck('text', 'id')
                    ->toArray();

                // Initialize option counts with zero responses (for this question's options only)
                $optionCounts = [];
                foreach ($options as $optionId => $optionText) {
                    $optionCounts[$optionId] = [
                        'id' => $optionId,
                        'value' => $optionText,
                        'count' => 0
                    ];
                }

                // Get all answers for this question
                $answers = DB::table('survey_answers')
                    ->where('survey_list_id', $survey_list_id)
                    ->where('question_id', $question->id)
                    ->select('answer_value', 'option_id')
                    ->get();

                $totalResponses = $answers->count();

                // Count the selected options
                foreach ($answers as $answer) {
                    $decoded = json_decode($answer->answer_value, true);
                    $values = is_array($decoded) ? $decoded : [$decoded];

                    foreach ($values as $v) {
                        $optionId = $answer->option_id ?? null;

                        if ($optionId && isset($optionCounts[$optionId])) {
                            $optionCounts[$optionId]['count']++;
                        }
                    }
                }

                ksort($optionCounts, SORT_NUMERIC);

                $questionsResult[] = [
                    'question_id' => $question->id,
                    'question' => $question->question,
                    'total_responses' => $totalResponses,
                    'options' => array_values($optionCounts),
                ];
            }


            // Sort questions by their ID
            usort($questionsResult, function ($a, $b) {
                return $a['question_id'] <=> $b['question_id'];
            });

            // Final output
            $result = [
                'survey_title' => $survey->survey_title,
                'questions' => $questionsResult,
            ];

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }




    public function getSurveyLinks()
    {
        try {
            // Fetch all surveys (title and link UUID)
            $surveys = DB::table('surveys_list')
                ->select('survey_title', 'survey_link')
                ->get();

            // Dynamically map app.url → survey base URL
            $currentAppUrl = config('app.url');

            $map = [
                'http://localhost:8001'                  => 'http://localhost:8002/survey',
                'https://admin-dev.cebulandmasters.com'  => 'https://ask-dev.cebulandmasters.com/survey',
                'https://admin-uat.cebulandmasters.com'  => 'https://ask-uat.cebulandmasters.com/survey',
                'https://admin.cebulandmasters.com'      => 'https://ask.cebulandmasters.com/survey',
            ];

            $defaultSurveyBaseUrl = 'https://ask.cebulandmasters.com/survey';

            $baseUrl = $map[$currentAppUrl] ?? $defaultSurveyBaseUrl;
            $baseUrl = rtrim($baseUrl, '/') . '/';

            $surveyLinks = [
                [
                    'surveyName' => 'N/A',
                    'surveyLink' => 'none',
                ],
            ];

            foreach ($surveys as $survey) {
                $surveyLinks[] = [
                    'surveyName' => $survey->survey_title,
                    'surveyLink' => $baseUrl . $survey->survey_link,
                ];
            }

            return response()->json($surveyLinks);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getSurveyTitle()
    {
        $survey = DB::table('surveys_list')
            ->where('status', "true")
            ->value('survey_title');

        if (!$survey) {
            return response()->json(['error' => 'Survey not found'], 404);
        }

        return response()->json(['survey_title' => $survey], 200);
    }
}
