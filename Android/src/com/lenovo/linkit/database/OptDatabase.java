package com.lenovo.linkit.database;

import android.content.Context;
import android.os.Environment;

import com.lenovo.linkit.log.FLog;

import java.io.*;


public class OptDatabase {
    private static String TAG = OptDatabase.class.getName();
    private static final int ASSETS_SUFFIX_BEGIN    = 101;
    private static final int ASSETS_SUFFIX_END      = 103;
    private static OptDatabase sInstance;
    private static Context mContext;

    public static OptDatabase getOptDatabase() {
        if (sInstance == null) {
            sInstance = new OptDatabase();
        }
        return sInstance;
    }

    private OptDatabase()
    {
    }

    public void init(Context context) {
        mContext = context;
    }

    private static String createFolder()
    {
        String status = Environment.getExternalStorageState();
        if (!status.equals(Environment.MEDIA_MOUNTED))
        {
            FLog.e(TAG, "Can not find external storage!");

            return null;
        }

        File sdcardDir = Environment.getExternalStorageDirectory();
        String path = sdcardDir.getPath()+"/linkit";

        File destDir  = new File(path);

        if (destDir .exists())
        {
            FLog.e(TAG, "linkit folder exist!");

            return path;
        }

        if (!destDir.mkdir())
        {
            FLog.e(TAG, "mkdir fail!");

            return null;
        }

        return path;
    }

    public static int copyBigDataBase() throws IOException
    {
        String sPath = createFolder();

        if (null == sPath)
        {
            FLog.w(TAG, "sPath is null!");

            return DBColumnField.CREATE_DATABASE_PATH_FAIL;
        }

        String outFileName = sPath + "/" + DBColumnField.DATABASE_NAME;
        File dbPath = new File(outFileName);

        if (dbPath.exists())
        {
            FLog.w(TAG, "Database exist!");

            return DBColumnField.DATABASE_EXIST;
        }

        InputStream myInput;
        OutputStream myOutput = new FileOutputStream(outFileName);

        for (int i = ASSETS_SUFFIX_BEGIN; i < ASSETS_SUFFIX_END+1; i++)
        {
            myInput = mContext.getAssets().open(DBColumnField.ASSETS_NAME);
            byte[] buffer = new byte[1024];
            int length;
            while ((length = myInput.read(buffer))>0)
            {
                myOutput.write(buffer, 0, length);
            }

            myOutput.flush();
            myInput.close();
        }

        myOutput.close();
        
        FLog.i(TAG, "copyBigDataBase finished.");

        return DBColumnField.COPY_DATABASE_SUCCESS;
    }
}
