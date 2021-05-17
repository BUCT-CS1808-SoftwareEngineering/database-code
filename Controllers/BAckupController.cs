using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.Security;
using System.Threading.Tasks;
using BAckup;
using System.Threading;

namespace BAckup.Controllers
{
    [ApiController]
    [Route("[controller]")]

    public class BAckupController : ControllerBase
    {
        
        [HttpGet]
        public string get()
        {
            return "1";
        }

        [HttpPost]
        public string Test1()
        {
                Process p = new Process();
                string filename = "msqldump";
                string command = "-uroot -pA4W^:s3aW33p --single-transaction --flush-logs --master-data=2 --all-databases --delete-master-logs >/root/BACkupfile/date_$(date '+%Y%m%d%H%M').sql ";
                p.StartInfo.FileName = filename;
               //p.StartInfo.FileName = "C:/Windows/notepad.exe";
                p.StartInfo.Arguments =command;
                p.StartInfo.UseShellExecute = true;
                try
                {
                    p.Start();
                    p.WaitForExit();
                }
                catch (Exception e)
                {
                    return (-1).ToString();
                }
                return p.ExitCode.ToString();
            
            
        }
    }
   
}
