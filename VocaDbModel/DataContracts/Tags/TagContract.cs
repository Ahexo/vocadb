﻿using System.Runtime.Serialization;
using VocaDb.Model.Domain;
using VocaDb.Model.Domain.Tags;

namespace VocaDb.Model.DataContracts.Tags {

	[DataContract(Namespace = Schemas.VocaDb)]
	public class TagContract : TagBaseContract {

		public TagContract() {
			AliasedTo = null;
		}

		public TagContract(Tag tag)
			: base(tag) {

			ParamIs.NotNull(() => tag);

			AliasedTo = tag.AliasedTo != null ? new TagBaseContract(tag.AliasedTo) : null;
			CategoryName = tag.CategoryName;
			Description = tag.Description;
			Parent = tag.Parent != null ? new TagBaseContract(tag.Parent) : null;
			Status = tag.Status;
			Version = tag.Version;

		}

		[DataMember]
		public TagBaseContract AliasedTo { get; set; }

		[DataMember]
		public string CategoryName { get; set; }

		[DataMember]
		public string Description { get; set; }

		[DataMember]
		public TagBaseContract Parent { get; set; }

		[DataMember]
		public EntryStatus Status { get; set; }

		[DataMember]
		public int Version { get; set; }

	}
}
