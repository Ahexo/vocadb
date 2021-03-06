﻿using System.Globalization;
using System.Web.Mvc;
using VocaDb.Model.Utils;
using VocaDb.Model.Utils.Config;

namespace VocaDb.Web.Controllers
{
    public class HelpController : ControllerBase
    {

		private readonly VdbConfigManager config;

		public HelpController(VdbConfigManager config) {
			this.config = config;
		}

        //
        // GET: /Help/

        public ActionResult Index()
        {
			
			if (!string.IsNullOrEmpty(AppConfig.ExternalHelpPath))
				return View("External");

			ViewBag.FreeTagId = config.SpecialTags.Free;
			ViewBag.InstrumentalTagId = config.SpecialTags.Instrumental;

			switch (CultureInfo.CurrentUICulture.TwoLetterISOLanguageName) {
				case "ja":
					return View("Index.ja");
				case "zh":
					return View("Index.zh-Hans");
				default:
					return View();
			}

        }

    }
}
