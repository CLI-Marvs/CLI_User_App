<?php

namespace App\Http\Controllers;

use App\Models\DynamicBanner;
use Illuminate\Http\Request;
use Google\Cloud\Storage\StorageClient;


class DynamicBannerController extends Controller
{

    private $keyJson;
    private $bucket;
    private $folderName;

    public function __construct()
    {
        if (config('services.app_url') === 'http://localhost:8001' || config('services.app_url') === 'https://admin-dev.cebulandmasters.com') {
            $this->keyJson = config('services.gcs.key_json');
            $this->bucket = 'super-app-storage';
            $this->folderName = 'concerns/';
        }

        if (config('services.app_url') === 'https://admin-uat.cebulandmasters.com') {
            $this->keyJson = config('services.gcs.key_json');
            $this->bucket = 'super-app-uat';
            $this->folderName = 'concerns-uat/';
        }

        if (config('services.app_url') === 'https://admin.cebulandmasters.com') {
            $this->keyJson = config('services.gcs_prod.key_json');
            $this->bucket = 'concerns-bucket';
            $this->folderName = 'concerns-attachments/';
        }
    }


    public function uploadToGCS($files)
    {


        if ($files) {
            $keyArray = json_decode($this->keyJson, true);
            $storage = new StorageClient([
                'keyFile' => $keyArray
            ]);
            $bucket = $storage->bucket($this->bucket);
            $originalFileName = $files->getClientOriginalName();
            $fileName = uniqid() . '.' . $files->getClientOriginalExtension();
            $filePath = $this->folderName . $fileName;

            $bucket->upload(
                fopen($files->getPathname(), 'r'),
                ['name' => $filePath]
            );

            $fileLink = $bucket->object($filePath)->signedUrl(new \DateTime('+10 years'));
        }

        return [
            'fileLink' => $fileLink,
            'originalFileName' => $originalFileName,
        ];
    }

    protected function deleteFromGCS($filePath)
    {
        
        $storage = new \Google\Cloud\Storage\StorageClient();
        $bucket = $storage->bucket($this->bucket);

        $object = $bucket->object($filePath);
        if ($object->exists()) {
            $object->delete();
        }
    }

    public function storeBanner(Request $request)
    {
        try {
            $bannerurl = $request->banner_link;

            $files = $request->file('banner_image');

            if ($files) {
                $fileLinks = $this->uploadToGCS($files);

                $dynamicbanner = new DynamicBanner();
                $dynamicbanner->banner_image = $fileLinks['fileLink'];
                $dynamicbanner->original_file_name = $fileLinks['originalFileName'];
                $dynamicbanner->banner_link = $bannerurl;
                $dynamicbanner->save();

                return response()->json(['message' => 'Banner created successfully!', 'data' => $dynamicbanner]);
            }
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error creating banner', 'error' => $e->getMessage()], 500);
        }
    }

    public function deleteBanner($id)
    {
        try {
           
            $banner = DynamicBanner::find($id);
    
            
            if (!$banner) {
                return response()->json(['message' => 'Banner not found'], 404);
            }
    
            
            $this->deleteFromGCS($banner->banner_image);
    
            $banner->delete();
    
            return response()->json(['message' => 'Banner deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error deleting banner', 'error' => $e->getMessage()], 500);
        }
    }


    public function getBanner(Request $request)
    {
        try {
            $banner = DynamicBanner::all();
            return response()->json(['message' => 'Banner created successfully!', 'data' => $banner]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error creating banner', 'error' => $e->getMessage()], 500);
        }
    }
}
