<?php

namespace App\Http\Controllers;

use App\Models\Concerns;
use App\Models\ExperienceRating;
use App\Models\Survey_forms;
use App\Models\Survey_list;
use App\Models\Survey_questions;
use App\Models\SurveyAnswer;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\Calculation\TextData\Replace;

class SurveyController extends Controller
{
    public function store(Request $request)
    {
        try {
            DB::beginTransaction();

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

            DB::commit();

            // Return the response with the survey ID
            return response()->json([
                'message' => 'Survey saved successfully',
                'survey_id' => $surveyId,  // Include the ID of the newly created survey
            ]);
        } catch (\Exception $e) {

            DB::rollBack();

            return response()->json([
                'message' => 'Error saving survey',
                'error' => $e->getMessage()
            ], 500);
        }
    }



    public function update(Request $request, $id)
    {
        $surveyData = $request->input('surveyData');
        $existingSurvey = Survey_list::findOrFail($id);

        if (!$existingSurvey->survey_link) {
            $existingSurvey->survey_link = Str::uuid();
        }

        $existingSurvey->update([
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

        $existingSurvey->touch();

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

                    $veryDissatisfiedUsers = [];
                    $totalResponses = 0;

                    /**
                     * 🚩 SCENARIO 1: Frontend input (normal survey flow)
                     */
                    $standardAnswers = DB::table('survey_answers')
                        ->where('survey_list_id', $survey_list_id)
                        ->where('question_id', $question->id)
                        ->whereNotNull('option_id')
                        ->select('option_id', 'ticket_id', 'created_at', 'experience_rating_id')
                        ->get();



                    $totalResponses += $standardAnswers->count();

                    foreach ($standardAnswers as $answer) {
                        $optionId = $answer->option_id;
                        if ($optionId && isset($optionCounts[$optionId])) {
                            $optionCounts[$optionId]['count']++;

                            if (strcasecmp($optionCounts[$optionId]['value'], "Very Dissatisfied") === 0) {

                                // Fetch the related experience_rating using experience_rating_id
                                $rating = null;
                                if ($answer->experience_rating_id) {
                                    $rating = DB::table('experience_ratings')
                                        ->where('id', $answer->experience_rating_id)
                                        ->select('ticket_id', 'email', 'created_at')
                                        ->first();
                                }

                                $veryDissatisfiedUsers[] = [
                                    'ticket_id' => $rating->ticket_id ?? null,
                                    'email'     => $rating->email ?? null,
                                    'timestamp' => $answer->created_at ?? $rating->created_at ?? null,
                                ];
                            }
                        }
                    }




                    /**
                     * 🚩 SCENARIO 2: Imported Google Form CSV (join experience_ratings)
                     */
                    $importedAnswers = DB::table('survey_answers as sa')
                        ->join('experience_ratings as er', DB::raw("CAST(sa.ticket_id AS TEXT)"), '=', DB::raw("CAST(er.ticket_id AS TEXT)"))
                        ->where('er.survey_title', trim($survey->survey_title))
                        ->whereRaw('LOWER(sa.question) = ?', [strtolower(trim($question->question))])
                        ->whereNotNull('sa.answer_value')
                        ->select('sa.answer_value', 'sa.ticket_id', 'er.email', 'er.created_at')
                        ->distinct()
                        ->get();

                    $totalResponses += $importedAnswers->count();

                    foreach ($importedAnswers as $answer) {
                        $values = array_map('trim', explode(',', $answer->answer_value));

                        foreach ($values as $value) {
                            foreach ($optionCounts as $optionId => &$option) {
                                if (strcasecmp($option['value'], $value) === 0) {
                                    $option['count']++;

                                    if (strcasecmp($value, "Very Dissatisfied") === 0) {
                                        $veryDissatisfiedUsers[] = [
                                            'ticket_id' => $answer->ticket_id,
                                            'email' => $answer->email,
                                            'timestamp' => $answer->created_at,
                                        ];
                                    }
                                }
                            }
                        }
                    }

                    usort($optionCounts, fn($a, $b) => $a['id'] <=> $b['id']);

                    usort($veryDissatisfiedUsers, function ($a, $b) {
                        return strtotime($b['timestamp']) <=> strtotime($a['timestamp']);
                    });

                    // Final result per question
                    $questionsResult[] = [
                        'question_id' => $question->id,
                        'question' => $question->question,
                        'input_type' => $question->input_type,
                        'total_responses' => $totalResponses,
                        'options' => array_values($optionCounts),
                        'very_dissatisfied_users' => $veryDissatisfiedUsers,
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
                        ->where('survey_title', trim($survey->survey_title))
                        ->pluck('ticket_id')
                        ->map(function ($ticketId) {
                            return preg_replace('/\D/', '', $ticketId); // Keep only numbers
                        })
                        ->filter()
                        ->unique()
                        ->values()
                        ->toArray();

                    if (!empty($importedTicketIds)) {
                        $importedAnswers = DB::table('survey_answers')
                            ->whereIn(DB::raw("REGEXP_REPLACE(ticket_id, '\\D', '', 'g')"), $importedTicketIds)
                            ->where('question', 'ILIKE', '%' . trim($question->question) . '%')
                            ->whereNotNull('answer_value')
                            ->select('answer_value')
                            ->get();

                        $totalResponses += $importedAnswers->count();

                        foreach ($importedAnswers as $answer) {
                            $rawAnswer = trim($answer->answer_value);

                            $values = preg_split('/,\s+(?=[A-Z])/', $rawAnswer);

                            foreach ($values as $value) {
                                $value = trim($value);
                                foreach ($optionCounts as $optionId => &$option) {
                                    // Match checkbox value exactly (case-insensitive)
                                    if (strcasecmp($option['value'], $value) === 0) {
                                        $option['count']++;
                                    }
                                }
                            }
                        }
                    }

                    usort($optionCounts, fn($a, $b) => $a['id'] <=> $b['id']);

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

                    $standardAnswers = DB::table('survey_answers')
                        ->where('survey_list_id', $survey_list_id)
                        ->where('question_id', $question->id)
                        ->whereNotNull('answer_value')
                        ->get();

                    foreach ($standardAnswers as $a) {
                        $experience = DB::table('experience_ratings')
                            ->where('id', $a->experience_rating_id)
                            ->select('email', 'ticket_id', 'created_at')
                            ->first();

                        $formattedAnswers[] = [
                            'ticket_id'    => $experience->ticket_id ?? null,
                            'email'        => $experience->email ?? null,
                            'answer_value' => $a->answer_value,
                            'date'   => $experience->created_at ?? $a->created_at, // fallback
                        ];
                    }

                    $totalResponses += $standardAnswers->count();

                    // Get imported answers (no question_id, no survey_list_id)
                    $rawTicketMap = DB::table('experience_ratings')
                        ->where('survey_title', trim($survey->survey_title))
                        ->select('ticket_id', 'email', 'created_at')
                        ->get()
                        ->mapWithKeys(function ($row) {
                            $numeric = preg_replace('/\D/', '', $row->ticket_id);
                            return [
                                $numeric => [
                                    'original'   => $row->ticket_id,
                                    'email'      => $row->email,
                                    'created_at' => $row->created_at,
                                ]
                            ];
                        })
                        ->toArray();

                    $importedTicketIds = array_keys($rawTicketMap);

                    if (!empty($importedTicketIds)) {
                        $importedAnswers = DB::table('survey_answers')
                            ->whereIn(DB::raw("REGEXP_REPLACE(ticket_id, '\\D', '', 'g')"), $importedTicketIds)
                            ->where('question', 'ILIKE', '%' . trim($question->question) . '%')
                            ->whereNotNull('answer_value')
                            ->select('ticket_id', 'answer_value', 'created_at')
                            ->get();

                        foreach ($importedAnswers as $a) {
                            $numericTicketId = preg_replace('/\D/', '', $a->ticket_id);

                            if (isset($rawTicketMap[$numericTicketId])) {
                                $formattedAnswers[] = [
                                    'ticket_id'    => $rawTicketMap[$numericTicketId]['original'],
                                    'email'        => $rawTicketMap[$numericTicketId]['email'],
                                    'answer_value' => $a->answer_value,
                                    'date'   => $rawTicketMap[$numericTicketId]['created_at'] ?? $a->created_at,
                                ];
                            }
                        }

                        $totalResponses += $importedAnswers->count();
                    }

                    usort($formattedAnswers, function ($a, $b) {
                        return strtotime($b['date']) <=> strtotime($a['date']);
                    });

                    $questionsResult[] = [
                        'question_id'      => $question->id,
                        'question'         => $question->question,
                        'input_type'       => $inputType,
                        'total_responses'  => $totalResponses,
                        'answers'          => $formattedAnswers,
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
            ->whereNotNull('rating')
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
                ->where('status', true)
                ->orderBy('created_at', 'asc')
                ->get();

            // Dynamically map app.url → survey base URL
            $currentAppUrl = config('app.url');

            $map = [
                'http://localhost:8001'                  => 'http://localhost:8002/survey',
                'https://admin-dev.cebulandmasters.com'  => 'https://feedback-dev.cebulandmasters.com/survey',
                'https://admin-dev2.cebulandmasters.com'  => 'https://feedback-dev.cebulandmasters.com/survey',
                'https://admin-uat.cebulandmasters.com'  => 'https://feedback-uat.cebulandmasters.com/survey',
                'https://master-cx.cebulandmasters.com'      => 'https://ask.cebulandmasters.com/survey',
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
            ->value('survey_title');

        if (!$survey) {
            return response()->json(['error' => 'Survey not found'], 404);
        }

        return response()->json(['survey_title' => $survey], 200);
    }

    public function getSurveysWithRatingCounts()
    {
        $surveys = Survey_list::select('id', 'survey_title', 'survey_link')
            ->where('status', true)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($survey) {
                $respondentsCount = 0;


                if (!empty($survey->survey_link)) {
                    $respondentsCount += ExperienceRating::where('survey_link', $survey->survey_link)
                        ->where('status', 'submitted')
                        ->count();
                }

                if (!empty($survey->survey_link)) {
                    $respondentsCount += ExperienceRating::where('survey_link', $survey->survey_link)
                        ->where('status', 'unsubmitted')
                        ->whereNotNull('rating')
                        ->count();
                }

                if (!empty($survey->survey_title)) {
                    $respondentsCount += ExperienceRating::where('survey_title', $survey->survey_title)
                        ->count();
                }

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
        $surveys = Survey_list::select('id', 'survey_title', 'survey_link')
            ->where('status', true)
            ->orderBy('created_at', 'asc')
            ->get();

        $result = $surveys->map(function ($survey) {

            $ratingCounts = ExperienceRating::where('survey_link', $survey->survey_link)
                ->whereNotNull('rating')
                ->select('rating', DB::raw('COUNT(*) as total'))
                ->groupBy('rating')
                ->pluck('total', 'rating');


            $fullRatingCounts = [];
            for ($i = 1; $i <= 5; $i++) {
                $fullRatingCounts[$i] = $ratingCounts->get($i, 0);
            }

            return [
                'id' => $survey->id,
                'survey_title' => $survey->survey_title,
                'ratings' => $fullRatingCounts,
            ];
        });

        return response()->json([
            'data' => $result
        ]);
    }

    public function getSurveyStatus($ticketId)
    {

        $survey = ExperienceRating::where('ticket_id', $ticketId)
            ->select('status')
            ->first();

        return response()->json([
            'status' => $survey ? $survey->status : 'none'
        ]);
    }

    public function getSurveyRatingDetails(Request $request, $id)
    {
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');
        $satisfaction = $request->query('satisfaction');

        $survey = Survey_list::find($id);

        if (!$survey) {
            return response()->json(['error' => 'Survey not found'], 404);
        }

        $ratingsQuery = ExperienceRating::where('survey_link', $survey->survey_link)
            ->whereNotNull('rating')
            ->orderBy('created_at', 'desc')
            ->select('ticket_id', 'email', 'rating', 'created_at', 'status');

        // ✅ Add date filter
        if ($startDate && $endDate) {
            $ratingsQuery->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        }

        if (!empty($satisfaction)) {
            $ratingMap = [
                'Very satisfied' => 5,
                'Satisfied' => 4,
                'Neutral' => 3,
                'Dissatisfied' => 2,
                'Very dissatisfied' => 1,
            ];

            if (isset($ratingMap[$satisfaction])) {
                $ratingsQuery->where('rating', $ratingMap[$satisfaction]);
            }
        }

        $ratings = $ratingsQuery->get();

        return response()->json([
            'survey_title' => $survey->survey_title,
            'data' => $ratings,
        ]);
    }

    public function getTotalResponses(Request $request, $id)
    {
        $survey = Survey_list::find($id);
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');
        $satisfaction = $request->query('satisfaction');

        if (!$survey) {
            return response()->json(['message' => 'Survey not found'], 404);
        }

        // Rating map for satisfaction filter
        $ratingMap = [
            'Very satisfied' => 5,
            'Satisfied' => 4,
            'Neutral' => 3,
            'Dissatisfied' => 2,
            'Very dissatisfied' => 1,
        ];

        $query1 = ExperienceRating::select('id')
            ->whereNotNull('rating')
            ->where(function ($q) use ($survey) {
                $q->where('survey_title', $survey->survey_title)
                    ->orWhere('survey_link', $survey->survey_link);
            });

        // Apply date filter to query1
        if ($startDate && $endDate) {
            $query1->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        }

        // Apply satisfaction filter to query1
        if ($satisfaction && isset($ratingMap[$satisfaction])) {
            $query1->where('rating', $ratingMap[$satisfaction]);
        }

        $query2 = ExperienceRating::select('id')
            ->whereNull('rating')
            ->where('status', 'submitted')
            ->where(function ($q) use ($survey) {
                $q->where('survey_title', $survey->survey_title)
                    ->orWhere('survey_link', $survey->survey_link);
            });

        if ($satisfaction && isset($ratingMap[$satisfaction])) {
            $query2->where('rating', $ratingMap[$satisfaction]);
        }

        // Apply date filter to query2
        if ($startDate && $endDate) {
            $query2->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        }

        $query3 = ExperienceRating::select('id')
            ->whereNull('rating')
            ->whereNull('status')
            ->where(function ($q) use ($survey) {
                $q->where('survey_title', $survey->survey_title)
                    ->orWhere('survey_link', $survey->survey_link);
            });

        if ($satisfaction && isset($ratingMap[$satisfaction])) {
            $query3->where('rating', $ratingMap[$satisfaction]);
        }

        // Apply date filter to query3
        if ($startDate && $endDate) {
            $query3->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        }

        $totalRespondents = $query1
            ->union($query2)
            ->union($query3)
            ->count();

        return response()->json($totalRespondents);
    }


    public function getMonthlyResponseChange(Request $request, $id)
    {
        $survey = Survey_list::find($id);
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');
        $satisfaction = $request->query('satisfaction');

        $ratingMap = [
            'Very satisfied' => 5,
            'Satisfied' => 4,
            'Neutral' => 3,
            'Dissatisfied' => 2,
            'Very dissatisfied' => 1,
        ];

        // Use custom date range if provided, otherwise use default month comparison
        if ($startDate && $endDate) {
            $currentMonthStart = $startDate . ' 00:00:00';
            $currentMonthEnd = $endDate . ' 23:59:59';
            // For comparison, use the same period from previous month
            $daysDiff = (strtotime($endDate) - strtotime($startDate)) / (60 * 60 * 24);
            $lastMonthStart = date('Y-m-d', strtotime($startDate . " -{$daysDiff} days")) . ' 00:00:00';
            $lastMonthEnd = $startDate . ' 00:00:00';
        } else {
            $currentMonthStart = now()->startOfMonth();
            $currentMonthEnd = now()->endOfMonth();
            $lastMonthStart = now()->subMonth()->startOfMonth();
            $lastMonthEnd = now()->subMonth()->endOfMonth();
        }

        $surveyCondition = function ($q) use ($survey) {
            $q->where('survey_title', $survey->survey_title)
                ->orWhere('survey_link', $survey->survey_link);
        };

        $currentQuery = ExperienceRating::where($surveyCondition)
            ->whereBetween('created_at', [$currentMonthStart, $currentMonthEnd])
            ->where(function ($q) {
                $q->whereNotNull('rating')
                    ->orWhere(function ($q2) {
                        $q2->whereNull('rating')
                            ->where('status', 'submitted');
                    })
                    ->orWhere(function ($q3) {
                        $q3->whereNull('rating')
                            ->whereNull('status');
                    });
            });

        // Apply satisfaction filter
        if ($satisfaction && isset($ratingMap[$satisfaction])) {
            $currentQuery->where('rating', $ratingMap[$satisfaction]);
        }

        $currentCount = $currentQuery->count();

        $lastQuery = ExperienceRating::where($surveyCondition)
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
            ->where(function ($q) {
                $q->whereNotNull('rating')
                    ->orWhere(function ($q2) {
                        $q2->whereNull('rating')
                            ->where('status', 'submitted');
                    })
                    ->orWhere(function ($q3) {
                        $q3->whereNull('rating')
                            ->whereNull('status');
                    });
            });

        // Apply satisfaction filter
        if ($satisfaction && isset($ratingMap[$satisfaction])) {
            $lastQuery->where('rating', $ratingMap[$satisfaction]);
        }

        $lastCount = $lastQuery->count();

        $percentageChange = 0;
        if ($lastCount > 0 || $currentCount > 0) {
            $totalRespondents = $currentCount + $lastCount;
            if ($totalRespondents > 0) {
                $percentageChange = (($currentCount - $lastCount) / $totalRespondents) * 100;
            }
        }

        $direction = $percentageChange > 0 ? 'positive' : ($percentageChange < 0 ? 'negative' : 'neutral');
        $percentageString = abs(round($percentageChange, 2)) . '%';

        return response()->json([
            'current_month' => $currentCount,
            'last_month' => $lastCount,
            'percentage_change' => $percentageString,
            'direction' => $direction,
        ]);
    }

    public function getAverageRating(Request $request, $id)
    {
        $survey = Survey_list::find($id);
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');
        $satisfaction = $request->query('satisfaction');

        $ratingMap = [
            'Very satisfied' => 5,
            'Satisfied' => 4,
            'Neutral' => 3,
            'Dissatisfied' => 2,
            'Very dissatisfied' => 1,
        ];

        $query = ExperienceRating::where(function ($q) use ($survey) {
            $q->where('survey_title', $survey->survey_title)
                ->orWhere('survey_link', $survey->survey_link);
        })
            ->whereNotNull('rating');

        // Apply date filter
        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        }

        // Apply satisfaction filter
        if ($satisfaction && isset($ratingMap[$satisfaction])) {
            $query->where('rating', $ratingMap[$satisfaction]);
        }

        $average = $query->avg('rating');

        if (!$average) {
            $averageString = "0";
        } else {
            $averageString = fmod($average, 1) == 0
                ? (string) intval($average)
                : number_format($average, 1);
        }

        return response()->json([
            'average_rating' => $averageString,
        ]);
    }

    public function getHighLowCount(Request $request, $id)
    {
        $survey = Survey_list::find($id);
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');
        $satisfaction = $request->query('satisfaction');

        $ratingMap = [
            'Very satisfied' => 5,
            'Satisfied' => 4,
            'Neutral' => 3,
            'Dissatisfied' => 2,
            'Very dissatisfied' => 1,
        ];

        $highestQuery = ExperienceRating::where(function ($q) use ($survey) {
            $q->where('survey_title', $survey->survey_title)
                ->orWhere('survey_link', $survey->survey_link);
        })
            ->where('rating', 5);

        // Apply date filter
        if ($startDate && $endDate) {
            $highestQuery->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        }

        // Apply satisfaction filter (only if "Very satisfied" is selected)
        if ($satisfaction && isset($ratingMap[$satisfaction])) {
            $highestQuery->where('rating', $ratingMap[$satisfaction]);
        }

        $highestCount = $highestQuery->count();

        $lowestQuery = ExperienceRating::where(function ($q) use ($survey) {
            $q->where('survey_title', $survey->survey_title)
                ->orWhere('survey_link', $survey->survey_link);
        })
            ->where('rating', 1);

        // Apply date filter
        if ($startDate && $endDate) {
            $lowestQuery->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        }

        // Apply satisfaction filter (only if "Very dissatisfied" is selected)
        if ($satisfaction && isset($ratingMap[$satisfaction])) {
            $lowestQuery->where('rating', $ratingMap[$satisfaction]);
        }

        $lowestCount = $lowestQuery->count();

        return response()->json([
            'highest_rated_count' => $highestCount,
            'lowest_rated_count' => $lowestCount,
        ]);
    }

    public function getSurveyResponses(Request $request, $survey_list_id)
    {

        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');
        $satisfaction = $request->query('satisfaction');
        try {
            // 1️⃣ Get survey info
            $survey = DB::table('surveys_list')
                ->where('id', $survey_list_id)
                ->select('id', 'survey_title', 'survey_link')
                ->first();

            if (!$survey) {
                return response()->json(['error' => 'Survey not found'], 404);
            }

            // 2️⃣ Get all questions
            $questions = DB::table('survey_questions')
                ->join('survey_forms', 'survey_questions.form_id', '=', 'survey_forms.id')
                ->where('survey_forms.survey_id', $survey_list_id)
                ->select('survey_questions.id', 'survey_questions.question')
                ->orderBy('survey_questions.id')
                ->get();

            $responseData = [];

            // 3️⃣ SCENARIO 1 — Normal survey submissions (only status = 'submitted')
            $experienceRatingsQuery = DB::table('experience_ratings')
                ->where(function ($q) use ($survey) {
                    $q->where('survey_title', $survey->survey_title)
                        ->orWhere('survey_link', $survey->survey_link);
                })
                ->where('status', 'submitted');

            if ($startDate && $endDate) {
                $experienceRatingsQuery->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
            }

            if ($satisfaction) {

                $ratingMap = [
                    'Very satisfied' => 5,
                    'Satisfied' => 4,
                    'Neutral' => 3,
                    'Dissatisfied' => 2,
                    'Very dissatisfied' => 1,
                ];

                if (isset($ratingMap[$satisfaction])) {
                    $experienceRatingsQuery->where('rating', $ratingMap[$satisfaction]);
                }
            }

            $experienceRatings = $experienceRatingsQuery
                ->select('id', 'ticket_id', 'rating', 'email', 'survey_owner', 'created_at', 'status', 'survey_link')
                ->get();

            foreach ($experienceRatings as $rating) {
                $row = [
                    'timestamp'    => $rating->created_at,
                    'email'        => $rating->email,
                    'ticket_id'    => $rating->ticket_id,
                    'survey_owner' => $rating->survey_owner,
                    'rating'       => $rating->rating,
                    'status'       => $rating->status ?? 'N/A',
                ];

                // ✅ Get answers for this experience rating
                $answers = DB::table('survey_answers')
                    ->where('experience_rating_id', $rating->id)
                    ->select('question_id', 'answer_value')
                    ->get();

                $groupedAnswers = $answers->groupBy('question_id')->map(function ($items) {
                    return $items->pluck('answer_value')->implode(', ');
                });

                // ✅ Get all question IDs from answers
                $questionIds = $answers->pluck('question_id')->unique()->toArray();

                // ✅ Fetch question texts for those IDs
                $questionsMap = DB::table('survey_questions')
                    ->whereIn('id', $questionIds)
                    ->pluck('question', 'id'); // returns [question_id => question_text]

                // ✅ Map answers with their corresponding question text
                foreach ($groupedAnswers as $questionId => $concatenatedAnswers) {
                    $questionText = $questionsMap[$questionId] ?? 'Unknown Question';
                    $row[$questionText] = $concatenatedAnswers;
                }

                $responseData[$rating->ticket_id] = $row;
            }


            // 4️⃣ SCENARIO 2 — Imported (Google Form)
            $importedAnswersQuery = DB::table('survey_answers as sa')
                ->join('experience_ratings as er', DB::raw("CAST(sa.ticket_id AS TEXT)"), '=', DB::raw("CAST(er.ticket_id AS TEXT)"))
                ->where(function ($q) use ($survey) {
                    $q->where('er.survey_title', $survey->survey_title)
                        ->orWhere('er.survey_link', $survey->survey_link);
                })
                ->where(function ($q) {
                    $q->where('er.status', 'submitted')
                        ->orWhereNull('er.status');
                });

            // Apply date filter if provided
            if ($startDate && $endDate) {
                $importedAnswersQuery->whereBetween('er.created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
            }

            if ($satisfaction) {
                $ratingMap = [
                    'Very satisfied' => 5,
                    'Satisfied' => 4,
                    'Neutral' => 3,
                    'Dissatisfied' => 2,
                    'Very dissatisfied' => 1,
                ];

                if (isset($ratingMap[$satisfaction])) {
                    $importedAnswersQuery->where('er.rating', $ratingMap[$satisfaction]);
                }
            }

            $importedAnswers = $importedAnswersQuery
                ->select('sa.ticket_id', 'er.email', 'er.created_at', 'er.status', 'sa.question', 'sa.answer_value')
                ->get()
                ->groupBy(function ($item) {
                    return $item->ticket_id . '_' . $item->created_at;
                });


            foreach ($importedAnswers as $groupKey => $answers) {
                $first = $answers->first();
                $row = [
                    'timestamp'    => $first->created_at,
                    'email'        => $first->email,
                    'ticket_id'    => $first->ticket_id,  // from $first, not the old key
                    'status'       => $first->status ?? 'N/A',
                ];


                foreach ($questions as $question) {
                    $answer = $answers->first(function ($a) use ($question) {
                        // Get just the question number and main text (before any parenthetical notes)
                        $cleanAnswerQuestion = preg_replace('/\s*\([^)]*\)\s*/', '', $a->question);
                        $cleanQuestion = preg_replace('/\s*\([^)]*\)\s*/', '', $question->question);

                        // Normalize whitespace
                        $cleanAnswerQuestion = preg_replace('/\s+/', ' ', trim($cleanAnswerQuestion));
                        $cleanQuestion = preg_replace('/\s+/', ' ', trim($cleanQuestion));

                        return strtolower($cleanAnswerQuestion) === strtolower($cleanQuestion);
                    });

                    $row[$question->question] = $answer?->answer_value ?? '';
                }



                $responseData[$groupKey] = $row;
            }



            // 5️⃣ Sort by latest timestamp
            $sortedData = collect($responseData)->values()->sortByDesc('timestamp')->values();

            // 6️⃣ Return response
            return response()->json([
                'survey_title' => $survey->survey_title,
                'headers' => array_merge(
                    ['timestamp', 'email', 'ticket_id', 'survey_owner', 'status'],
                    $questions->pluck('question')->toArray()
                ),
                'data' => $sortedData->values(),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }


    public function getConcernTicket($ticketId)
    {
        $ticketId = urldecode($ticketId); // Decode if necessary
        try {
            $concern = Concerns::where('ticket_id', $ticketId)->first();
            return response()->json($concern);
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }

    public function getSurveyUpdatedTimestamp($ticketId)
    {
        $survey = Survey_list::find($ticketId);

        if (!$survey) {
            return response()->json(['message' => 'Survey not found'], 404);
        }

       
        $latestTimestamp = ExperienceRating::where('survey_link', $survey->survey_link)
            ->whereNotNull('rating')
            ->max('updated_at');

        
        if (!$latestTimestamp) {
            $latestTimestamp = ExperienceRating::where('survey_title', $survey->survey_title)
                ->max('created_at');
        }

        return response()->json([
            'latest_timestamp' => $latestTimestamp
        ]);
    }
}
