﻿using System.Collections.Generic;
using System.Linq;
using VocaDb.Model.Database.Repositories;
using VocaDb.Model.Domain.Artists;
using VocaDb.Model.Domain.Songs;
using VocaDb.Model.Domain.Users;
using VocaDb.Model.Helpers;
using VocaDb.Model.Service.QueryableExtenders;

namespace VocaDb.Model.Service.Queries {

	public class RelatedSongsQuery {

		private readonly IDatabaseContext<Song> ctx;

		private Artist[] GetMainArtists(Song song, IList<IArtistWithSupport> creditableArtists) {

			return ArtistHelper.GetProducers(creditableArtists, SongHelper.IsAnimation(song.SongType)).Select(a => a.Artist).ToArray();

		}

		public RelatedSongsQuery(IDatabaseContext<Song> ctx) {

			ParamIs.NotNull(() => ctx);

			this.ctx = ctx;

		}

		public RelatedSongs GetRelatedSongs(Song song) {

			ParamIs.NotNull(() => song);

			var songs = new RelatedSongs();
			var songId = song.Id;
			var loadedSongs = new List<int>(20) { songId };

			var creditableArtists = song.Artists.Where(a => a.Artist != null && !a.IsSupport).ToArray();

			var mainArtists = GetMainArtists(song, creditableArtists);

			if (mainArtists != null && mainArtists.Any()) {

				var mainArtistIds = mainArtists.Select(a => a.Id).ToArray();
				var songsByMainArtists = ctx.Query()
					.Where(s =>
						s.Id != songId
						&& !s.Deleted 
						&& s.AllArtists.Any(a => 
							!a.IsSupport 
							&& mainArtistIds.Contains(a.Artist.Id)))
					.OrderBy(SongSortRule.RatingScore)
					.Take(16)
					.ToArray();

				songs.ArtistMatches = songsByMainArtists;
				loadedSongs.AddRange(songsByMainArtists.Select(s => s.Id));

			}

			if (song.RatingScore > 0) {
				
				var userIds = song.UserFavorites.Select(u => u.User.Id).ToArray();
				var likeMatches = ctx.OfType<FavoriteSongForUser>()
					.Query()
					.Where(f => 
						userIds.Contains(f.User.Id) 
						&& !loadedSongs.Contains(f.Song.Id)
						&& !f.Song.Deleted)
					.GroupBy(f => f.Song.Id)
					.Select(f => new { SongId = f.Key, Ratings = f.Count() })
					.OrderByDescending(f => f.Ratings)
					.Select(s => s.SongId)
					.Take(12)
					.ToArray();

				songs.LikeMatches = ctx.Query().Where(s => likeMatches.Contains(s.Id)).ToArray();
				loadedSongs.AddRange(likeMatches);

			}

			if (song.Tags.Tags.Any()) {

				// Take top 5 tags
				var tagIds = song.Tags.Usages.OrderByDescending(u => u.Count).Take(5).Select(t => t.Tag.Id).ToArray();

				var songsWithTags =
					ctx.Query().Where(s => 
						s.Id != songId
						&& !loadedSongs.Contains(s.Id) 
						&& !s.Deleted 
						&& s.Tags.Usages.Any(t => tagIds.Contains(t.Tag.Id)))
					.OrderBy(SongSortRule.RatingScore)
					.Take(12)
					.ToArray();

				songs.TagMatches = songsWithTags;

			}

			return songs;

		}

	}

	public class RelatedSongs {

		public RelatedSongs() {
			ArtistMatches = new Song[0];
			LikeMatches = new Song[0];
			TagMatches = new Song[0];
		}

		public Song[] ArtistMatches { get; set; }

		public Song[] LikeMatches { get; set; }

		public Song[] TagMatches { get; set; }

	}

}
