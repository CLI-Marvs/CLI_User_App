<?php

namespace App\Http\Controllers;

use App\Models\ExperienceRating;
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
            // 1. Get the survey title
            $survey = DB::table('surveys_list')
                ->where('id', $survey_list_id)
                ->select('survey_title')
                ->first();

            if (!$survey) {
                return response()->json(['error' => 'Survey not found'], 404);
            }

            // 2. Get all survey questions with input_type
            $questions = DB::table('survey_questions')
                ->join('survey_forms', 'survey_questions.form_id', '=', 'survey_forms.id')
                ->where('survey_forms.survey_id', $survey_list_id)
                ->select('survey_questions.id', 'survey_questions.question', 'survey_questions.input_type')
                ->get();

            $questionsResult = [];

            foreach ($questions as $question) {
                $inputType = $question->input_type;

                if ($inputType === 'multiple-choice') {
                    // 1. Get options for the question
                    $options = DB::table('survey_options')
                        ->where('question_id', $question->id)
                        ->pluck('text', 'id')
                        ->toArray();

                    $optionCounts = [];
                    foreach ($options as $optionId => $text) {
                        $optionCounts[$optionId] = [
                            'id' => $optionId,
                            'value' => $text,
                            'count' => 0
                        ];
                    }

                    // 2. Count normal answers using option_id
                    $standardAnswers = DB::table('survey_answers')
                        ->where('survey_list_id', $survey_list_id)
                        ->where('question_id', $question->id)
                        ->whereNotNull('option_id')
                        ->select('option_id')
                        ->get();

                    $totalResponses = $standardAnswers->count();

                    foreach ($standardAnswers as $answer) {
                        $optionId = $answer->option_id;
                        if ($optionId && isset($optionCounts[$optionId])) {
                            $optionCounts[$optionId]['count']++;
                        }
                    }

                    // 3. Handle imported answers (match by ticket_id + question text + survey_title)
                    $importedTicketIds = DB::table('experience_ratings')
                        ->where('survey_title', $survey->survey_title)
                        ->pluck('ticket_id') // e.g. ["Ticket#2500000861"]
                        ->map(function ($ticketId) {
                            return preg_replace('/\D/', '', $ticketId); // remove non-numeric, get "2500000861"
                        })
                        ->toArray();

                    if (!empty($importedTicketIds)) {
                        $importedAnswers = DB::table('survey_answers')
                            ->whereIn('ticket_id', $importedTicketIds)
                            ->where('question', $question->question)
                            ->whereNotNull('answer_value')
                            ->select('answer_value')
                            ->get();

                        $totalResponses += $importedAnswers->count();

                        foreach ($importedAnswers as $answer) {
                            $raw = $answer->answer_value;

                            // handle both single and multiple comma-separated values
                            $values = array_map('trim', explode(',', $raw));

                            foreach ($values as $value) {
                                foreach ($optionCounts as $optionId => &$option) {
                                    if (strcasecmp($option['value'], $value) === 0) {
                                        $option['count']++;
                                    }
                                }
                            }
                        }
                    }

                    // 4. Final result
                    $questionsResult[] = [
                        'question_id' => $question->id,
                        'question' => $question->question,
                        'input_type' => $inputType,
                        'total_responses' => $totalResponses,
                        'options' => array_values($optionCounts),
                    ];
                } elseif ($inputType === 'checkboxes') {
                    // 1. Get all options for this question
                    $options = DB::table('survey_options')
                        ->where('question_id', $question->id)
                        ->pluck('text', 'id')
                        ->toArray();

                    $optionCounts = [];
                    foreach ($options as $optionId => $text) {
                        $optionCounts[$optionId] = [
                            'id' => $optionId,
                            'value' => $text,
                            'count' => 0
                        ];
                    }

                    // 2. Count standard answers (option_id exists)
                    $standardAnswers = DB::table('survey_answers')
                        ->where('survey_list_id', $survey_list_id)
                        ->where('question_id', $question->id)
                        ->whereNotNull('option_id')
                        ->select('option_id')
                        ->get();

                    $totalResponses = $standardAnswers->count();

                    foreach ($standardAnswers as $answer) {
                        $optionId = $answer->option_id;
                        if ($optionId && isset($optionCounts[$optionId])) {
                            $optionCounts[$optionId]['count']++;
                        }
                    }

                    // 3. Get imported ticket IDs based on matching survey_title
                    $importedTicketIds = DB::table('experience_ratings')
                        ->where('survey_title', $survey->survey_title)
                        ->pluck('ticket_id')
                        ->map(function ($ticketId) {
                            return preg_replace('/\D/', '', $ticketId);
                        })
                        ->toArray();

                    // 4. Count imported answers using string matching
                    if (!empty($importedTicketIds)) {
                        $importedAnswers = DB::table('survey_answers')
                            ->whereIn('ticket_id', $importedTicketIds)
                            ->where('question', $question->question)
                            ->whereNotNull('answer_value')
                            ->select('answer_value')
                            ->get();

                        $totalResponses += $importedAnswers->count();

                        foreach ($importedAnswers as $answer) {
                            $rawAnswer = trim($answer->answer_value);

                            // Safely loop through options and match each one against the full answer_value
                            foreach ($optionCounts as $optionId => &$option) {
                                // Match if option exists as a complete value in the answer (case-insensitive, trimmed)
                                $pattern = '/(^|,\s*)' . preg_quote($option['value'], '/') . '(\s*,|$)/i';

                                if (preg_match($pattern, $rawAnswer)) {
                                    $option['count']++;
                                }
                            }
                        }
                    }

                    // 5. Store final result
                    $questionsResult[] = [
                        'question_id' => $question->id,
                        'question' => $question->question,
                        'input_type' => $inputType,
                        'total_responses' => $totalResponses,
                        'options' => array_values($optionCounts),
                    ];
                } else {
                    $formattedAnswers = [];
                    $totalResponses = 0;

                    // ✅ 1. Get standard answers (question_id + survey_list_id)
                    $standardAnswers = DB::table('survey_answers')
                        ->where('survey_list_id', $survey_list_id)
                        ->where('question_id', $question->id)
                        ->whereNotNull('answer_value')
                        ->get();

                    $formattedAnswers = [];
                    foreach ($standardAnswers as $a) {
                        $email = DB::table('experience_ratings')
                            ->where('id', $a->experience_rating_id) // ✅ join via foreign key
                            ->value('email');

                        $ticketId = DB::table('experience_ratings')
                            ->where('id', $a->experience_rating_id)
                            ->value('ticket_id');

                        $formattedAnswers[] = [
                            'ticket_id' => $ticketId,
                            'email' => $email,
                            'answer_value' => $a->answer_value,
                        ];
                    }


                    $totalResponses += $standardAnswers->count();

                    // ✅ 2. Get imported answers (no question_id, no survey_list_id)
                    $importedTicketIds = DB::table('experience_ratings')
                        ->where('survey_title', $survey->survey_title)
                        ->pluck('ticket_id', 'ticket_id')
                        ->mapWithKeys(function ($ticketId) {
                            return [preg_replace('/\D/', '', $ticketId) => $ticketId];
                        })
                        ->toArray(); // [numeric_ticket_id => original_ticket_id]

                    if (!empty($importedTicketIds)) {
                        $importedAnswers = DB::table('survey_answers')
                            ->whereIn('ticket_id', array_keys($importedTicketIds))
                            ->where('question', $question->question)
                            ->whereNotNull('answer_value')
                            ->select('ticket_id', 'answer_value')
                            ->get();

                        foreach ($importedAnswers as $a) {
                            $numericTicketId = $a->ticket_id;
                            $originalTicketId = $importedTicketIds[$numericTicketId] ?? null;

                            $email = DB::table('experience_ratings')
                                ->where('ticket_id', $originalTicketId)
                                ->value('email');

                            $formattedAnswers[] = [
                                'ticket_id' => $originalTicketId,
                                'email' => $email,
                                'answer_value' => $a->answer_value,
                            ];
                        }

                        $totalResponses += $importedAnswers->count();
                    }

                    // ✅ Final result
                    $questionsResult[] = [
                        'question_id' => $question->id,
                        'question' => $question->question,
                        'input_type' => $inputType,
                        'total_responses' => $totalResponses,
                        'answers' => $formattedAnswers,
                    ];
                }
            }

            // 5. Sort and return
            usort($questionsResult, fn($a, $b) => $a['question_id'] <=> $b['question_id']);

            return response()->json([
                'survey_title' => $survey->survey_title,
                'questions' => $questionsResult,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }




    public function countRatings($id)
    {
        $surveyList = Survey_list::find($id);

        if (!$surveyList) {
            return response()->json(['error' => 'Survey list not found'], 404);
        }


        $surveyLink = $surveyList->survey_link;

        $ratings = ExperienceRating::select('rating', DB::raw('COUNT(*) as total'))
            ->where('survey_link', $surveyLink)
            ->groupBy('rating')
            ->get();

        return response()->json(['data' => $ratings]);
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
                'https://admin-dev.cebulandmasters.com'  => 'https://feedback-dev.cebulandmasters.com/survey',
                'https://admin-uat.cebulandmasters.com'  => 'https://feedback-uat.cebulandmasters.com/survey',
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

    public function getSurveyTitle($id)
    {
        $survey = DB::table('surveys_list')
            ->where('id', $id)
            ->where('status', 'true')
            ->value('survey_title');

        if (!$survey) {
            return response()->json(['error' => 'Survey not found'], 404);
        }

        return response()->json(['survey_title' => $survey], 200);
    }

    public function getSurveysWithRatingCounts()
    {
        $surveys = Survey_list::select('id', 'survey_title', 'survey_link')
            ->get()
            ->map(function ($survey) {
                $respondentsCount = ExperienceRating::where('survey_link', $survey->survey_link)->count();

                return [
                    'id' => $survey->id,
                    'survey_title' => $survey->survey_title,
                    'respondents_count' => $respondentsCount,
                ];
            });

        return response()->json([
            'data' => $surveys
        ]);
    }

    public function getSurveysWithRatingBreakdown()
    {
        $surveys = Survey_list::select('id', 'survey_title', 'survey_link')->get();

        $result = $surveys->map(function ($survey) {
            // Fetch counts of each rating (1-5) for this survey_link
            $ratingCounts = ExperienceRating::where('survey_link', $survey->survey_link)
                ->select('rating', DB::raw('COUNT(*) as total'))
                ->groupBy('rating')
                ->pluck('total', 'rating'); // [rating => count]

            // Ensure all ratings from 1 to 5 are included, default to 0 if missing
            $fullRatingCounts = [];
            for ($i = 1; $i <= 5; $i++) {
                $fullRatingCounts[$i] = $ratingCounts->get($i, 0);
            }

            return [
                'id' => $survey->id,
                'survey_title' => $survey->survey_title,
                'ratings' => $fullRatingCounts, // e.g., [1 => 3, 2 => 0, 3 => 5, 4 => 2, 5 => 8]
            ];
        });

        return response()->json([
            'data' => $result
        ]);
    }

    public function getSurveyRatingDetails($id)
    {

        $survey = Survey_list::find($id);

        if (!$survey) {
            return response()->json(['error' => 'Survey not found'], 404);
        }


        $ratings = ExperienceRating::where('survey_link', $survey->survey_link)
            ->orderBy('created_at', 'desc')
            ->select('ticket_id', 'email', 'rating', 'created_at')
            ->get();


        return response()->json([
            'data' => $ratings,
        ]);
    }
}
